/*
 * Copyright (C) 2002-2015 Igor Sysoev
 * Copyright (C) 2011-2015 Nginx, Inc.
 * Copyright (C) 2015 Marcin Kaciuba
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */
#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include "ngx_url_parser.h"

typedef unsigned char u_char;

static uint32_t  usual[] = {
     0xffffdbfe, /* 1111 1111 1111 1111  1101 1011 1111 1110 */

                 /* ?>=< ;:98 7654 3210  /.-, +*)( '&%$ #"!  */
     0x7fff37d6, /* 0111 1111 1111 1111  0011 0111 1101 0110 */

                 /* _^]\ [ZYX WVUT SRQP  ONML KJIH GFED CBA@ */
     0xffffffff, /* 1111 1111 1111 1111  1111 1111 1111 1111 */

                 /*  ~}| {zyx wvut srqp  onml kjih gfed cba` */
     0xffffffff, /* 1111 1111 1111 1111  1111 1111 1111 1111 */

     0xffffffff, /* 1111 1111 1111 1111  1111 1111 1111 1111 */
     0xffffffff, /* 1111 1111 1111 1111  1111 1111 1111 1111 */
     0xffffffff, /* 1111 1111 1111 1111  1111 1111 1111 1111 */
     0xffffffff  /* 1111 1111 1111 1111  1111 1111 1111 1111 */
};

int ngx_url_parser_meta(ngx_http_url_meta *r, const char *b);

void init_default_meta(ngx_http_url_meta *r) {
    r->scheme_start= NULL;
    r->scheme_end = NULL;
    r->host_start = NULL;
    r->host_end = NULL;
    r->uri_start = NULL;
    r->uri_end= NULL;
    r->args_start = NULL;
    r->args_end= NULL;
    r->fragment_start = NULL;
    r->fragment_end= NULL;
    r->port_end = NULL;
    r->auth_start = NULL;
    r->auth_end = NULL;
    r->url_end = NULL;
};

void init_default_url(ngx_http_url* url) {
    url->scheme = NULL;
    url->host = NULL;
    url->path = NULL;
    url->query = NULL;
    url->fragment = NULL;
    url->port = NULL;
    url->auth = NULL;
};

void copy_from_meta(char **dest, const char * start, const char * end) {
    int size = end - start + 1;
    *dest = (char*)malloc(size);
    memcpy((void*)*dest, start, size - 1);
    (*dest)[size - 1] = '\0';
}

int ngx_url_parser(ngx_http_url * url, const char *b) {
    init_default_url(url);

    ngx_http_url_meta meta;

    int status = ngx_url_parser_meta(&meta, b);

    if (status != NGX_URL_OK) {
    #ifdef NGX_DEBUG
        printf("Wrong status from meta!");
    #endif
        return status;
    }

    if (meta.scheme_end) {
        copy_from_meta(&(url->scheme), meta.scheme_start, meta.scheme_end);
    }

    if (meta.host_end) {
        copy_from_meta(&url->host, meta.host_start, meta.host_end);
    }

    if (meta.uri_start) {
        copy_from_meta(&url->path, meta.uri_start, meta.uri_end);
    }

    if (meta.args_start) {
        copy_from_meta(&url->query, meta.args_start, meta.args_end);
    }

    if (meta.fragment_start) {
        copy_from_meta(&url->fragment, meta.fragment_start, meta.fragment_end);
    }

    if (meta.port_end) {
        copy_from_meta(&url->port, meta.port_start, meta.port_end);
    }

    if (meta.auth_end) {
        copy_from_meta(&url->auth, meta.auth_start, meta.auth_end);
    }

    return status;
}

void ngx_url_free(ngx_http_url * url) {

    if (url->scheme != NULL) {
        free((void*)url->scheme);
        url->scheme = NULL;
    }

    if (url->host != NULL) {
        free((void*)url->host);
        url->host = NULL;
    }

    if (url->path != NULL) {
        free((void*)url->path);
        url->path = NULL;
    }

    if (url->query != NULL) {
        free((void*)url->query);
        url->query= NULL;
    }

    if (url->fragment != NULL) {
        free((void*)url->fragment);
        url->fragment = NULL;
    }

    if (url->port != NULL) {
        free((void*)url->port);
        url->port = NULL;
    }

    if (url->auth != NULL) {
        free((void*)url->auth);
        url->auth = NULL;
    }

}

int ngx_url_parser_meta(ngx_http_url_meta *r, const char *b) {
    u_char  c, ch;
    const char *p;

    init_default_meta(r);

    r->url_start = b;

    sw_state state = sw_scheme;

    unsigned int len = strlen(b);
    unsigned int counter = 0;
    unsigned int maybe_auth = 0;

    for (p = b; p != '\0'; p++, counter++) {
        ch = *p;

        switch (state) {

        case sw_scheme:

            c = (u_char) (ch | 0x20);
            if (c >= 'a' && c <= 'z') {
                break;
            }

            switch (ch) {
                case ':':
                    // here we have scheme
                    r->scheme_start = r->url_start;
                    r->uri_start = NULL;

                    r->scheme_end = p;
                    state = sw_scheme_slash;
                    break;
                case '/':
                    state = sw_scheme_slash_slash;
                    r->uri_start = r->url_start;
                    break;
                case '?':
                    if (counter <= len) {
                        r->args_start = p + 1;
                    }
                    state = sw_args;
                    break;
                case '#':
                    if (counter <= len) {
                        r->fragment_start = p + 1;
                    }
                    state = sw_fragment;
                    break;
                case '\0':
                    r->uri_start = r->url_start;
                    r->uri_end = p;
                    goto done;
                    break;
                default:
                    state = sw_uri;
                    r->uri_start = r->url_start;
                    break;
            }
            break;

        case sw_scheme_slash:
            switch (ch) {
                case '/':
                    state = sw_scheme_slash_slash;
                    break;
                default:
                    #ifdef NGX_DEBUG
                        printf("No slash after scheme\n");
                    #endif
                    return NGX_URL_INVALID;
            }
            break;

        case sw_scheme_slash_slash:

            if (ch != '/' && (usual[ch >> 5] & (1 << (ch & 0x1f)))) {
                state = sw_uri;
                break;
            }

            switch (ch) {
                case '/':
                    r->uri_start = NULL;
                    state = sw_host_start;
                    break;
                case '?':
                    r->uri_end = p;
                    if (counter <= len) {
                        r->args_start = p + 1;
                    }
                    state = sw_args;
                    break;
                case '\0':
                    r->uri_start = r->url_start;
                    r->uri_end = p;
                    goto done;
                    break;
                default:
                    state = sw_uri;
                    break;
                }
            break;

        case sw_host_start:

            r->host_start = p;

            if (ch == '[') {
                state = sw_host_ip_literal;
                break;
            }

            state = sw_host;

            /* fall through */

        case sw_host:

            c = (u_char) (ch | 0x20);
            if (c >= 'a' && c <= 'z') {
                break;
            }

            if ((ch >= '0' && ch <= '9') || ch == '.' || ch == '-' || ch == '_') {
                break;
            }

            /* fall through */

        case sw_host_end:

            r->host_end = p;
            switch (ch) {
                case ':':
                    state = sw_port;
                    if (counter <= len) {
                        r->port_start = p + 1;
                    }
                    break;
                case '/':
                    r->uri_start = p;
                    state = sw_uri;
                    break;
                case '?':
                    if (counter <= len) {
                        r->args_start = p + 1;
                    }
                    state = sw_args;
                    break;
                case '#':
                    state = sw_fragment;
                    if (counter <= len) {
                        r->fragment_start = p + 1;
                        state = sw_fragment;
                    }
                    break;
                case '\0':
                    goto done;
                default:
                    #ifdef NGX_DEBUG
                        printf("Inpropert host\n");
                    #endif
                    return NGX_URL_INVALID;
                }
            break;

        case sw_host_ip_literal:

            if (ch >= '0' && ch <= '9') {
                break;
            }

            c = (u_char) (ch | 0x20);
            if (c >= 'a' && c <= 'z') {
                break;
            }

            switch (ch) {
                case ':':
                    break;
                case ']':
                    state = sw_host_end;
                    break;
                case '-':
                case '.':
                case '_':
                case '~':
                    /* unreserved */
                    break;
                case '!':
                case '$':
                case '&':
                case '\'':
                case '(':
                case ')':
                case '*':
                case '+':
                case ',':
                case ';':
                case '=':
                    /* sub-delims */
                    break;
                default:
                    #ifdef NGX_DEBUG
                        printf("Invalid ip\n");
                    #endif
                    return NGX_URL_INVALID;
            }
            break;

        case sw_port:
            if (ch >= '0' && ch <= '9') {
                break;
            }

            switch (ch) {
                case '\0':
                    r->port_end = p;
                    goto done;
                    break;
                case '/':
                    r->port_end = p;
                    r->uri_start = p;
                    state = sw_uri;
                    break;
                case '?':
                    r->port_end = p;
                    if (counter <= len) {
                        r->args_start = p + 1;
                    }
                    state = sw_args;
                    break;
                case '#':
                    r->port_end = p;
                    if (counter <= len) {
                        r->fragment_start= p + 1;
                    }
                    state = sw_fragment;
                    break;
                case '@':
                    r->auth_end = p;
                    r->auth_start = r->host_start;
                    r->host_start = NULL;
                    r->host_end = NULL;
                    r->port_start = NULL;
                    r->port_end = NULL;
                    state = sw_host_start;
                    break;
                default:
                    // this is ugly  but I don't want to check if there is
                    // '@' in url
                    maybe_auth = 1;
                }
            break;

        /* URI path */
        case sw_uri:

            if (usual[ch >> 5] & (1 << (ch & 0x1f))) {
                break;
            }

            switch (ch) {
                case '\0':
                    r->uri_end = p;
                    goto done;
                    break;
                case '#':
                    r->uri_end = p;
                    if (counter <= len) {
                        r->fragment_start = p + 1;
                        state = sw_fragment;
                    }
                    break;
                case '?':
                    r->uri_end = p;
                    if (counter <= len) {
                        r->args_start = p + 1;
                    }
                    state = sw_args;
                    break;
                }
            break;

            case sw_args:
                if (usual[ch >> 5] & (1 << (ch & 0x1f))) {
                    break;
                }

                switch (ch) {
                    case '#':
                        r->args_end = p;
                        if (counter <= len) {
                            r->fragment_start= p + 1;
                        }
                        state = sw_fragment;
                        break;
                    case '\0':
                        r->args_end = p;
                        goto done;
                        break;
                }
                break;

        case sw_fragment:

            switch (ch) {
                case '\0':
                    r->fragment_end = p;
                    goto done;
                }
            break;

        }
    }
#ifdef NGX_DEBUG
    printf("Error invalid url!");
#endif
    return NGX_URL_INVALID;

done:
    if (r->url_end == NULL) {
        r->url_end = p;
    }

    // when there are alphabetic characters in port and there isn't @ in url is
    // incorrect
    if (maybe_auth && r->auth_end == NULL) {
        return NGX_URL_INVALID;
    }

    return NGX_URL_OK;
}
