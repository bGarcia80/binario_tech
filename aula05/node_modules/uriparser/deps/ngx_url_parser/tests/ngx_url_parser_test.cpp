#include "gtest/gtest.h"

extern "C" {
    #include "../ngx_url_parser.h"
}

TEST(ngx_url_parser, SW_scheme_QUERY) {
    const char * str = "?818181";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_STREQ(url.query, "818181");
    ASSERT_EQ(NGX_URL_OK, status);
    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_scheme_PATH) {
    const char * str = "/818181";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.path, "/818181");
    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_HOST_IPv6){
    const char * str = "htt://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_STREQ(url.host, "[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210]");
    ASSERT_STREQ(url.scheme, "htt");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_EQ(NGX_URL_OK, status);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_HOST_IPv6_PATH){
    const char * str = "http://[::192.9.5.5]/ipng";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.path, "/ipng");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);

    ngx_url_free(&url);
}


TEST(ngx_url_parser, SW_PORT_IPv6){
    const char * str = "http://[::192.9.5.5]:80";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, USER_PASS){
    const char * str = "http://user:pass@[::192.9.5.5]:80";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, "user:pass");
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_DOT){
    const char * str = "http://[::192.9.5.5]:80/.";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "/.");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_PERCENT){
    const char * str = "http://[::192.9.5.5]:80/%";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "/%");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_MORE_PERCENT){
    const char * str = "http://[::192.9.5.5]:80/%%%%";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "/%%%%");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_SLASH){
    const char * str = "http://[::192.9.5.5]:80///";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "///");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_SLASH_FRAGMENT){
    const char * str = "http://[::192.9.5.5]:80///#fragment";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "///");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, "fragment");

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_STRANGE_CHAR) {
    const char * str = "http://[::192.9.5.5]:80/{query";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "/{query");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_CHECK_URI_MORE_HASH){
    const char * str = "http://[::192.9.5.5]:80/###fragment";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.fragment, "##fragment");
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_CHECK_URI_EMPTY_HASH){
    const char * str = "http://[::192.9.5.5]:80/#";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "[::192.9.5.5]");
    ASSERT_STREQ(url.port, "80");
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.fragment, "");
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_CHECK_URI_USER){
    const char * str = "http://example.com/~mkaciuba/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "example.com");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "/~mkaciuba/");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_STRANGE_CHAR2){
    const char * str = "http://www.example.com/te%CC%81st.html";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "www.example.com");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "/te%CC%81st.html");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_STRANGE_CHAR3){
    const char * str = "http://www.example.com/|||";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "www.example.com");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "/|||");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}


TEST(ngx_url_parser, SW_AFTER_SLASH_IN_URI_STRANGE_CHAR4){
    const char * str = "http://www.example.com/ś_,";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "www.example.com");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.path, "/ś_,");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}
