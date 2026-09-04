#include <stdio.h>

#include "ngx_url_parser.h"

int main(int argc, char *argv[])
{
    const char * str = "https://user:password@mkaciuba.pl:555/path/?query#fragment";
    // structure in with result will be stored
    ngx_http_url url;

    int status = ngx_url_parser(&url, str);
    if (status != NGX_URL_OK) {
        printf("Error processing url!\n");
        return 1;
    }

    printf("Url = %s\n", str);
    printf("\nParse status %d", status);
    printf("\n scheme = %s", url.scheme);
    printf("\n Host = %s", url.host);
    printf("\n Port = %s", url.port);
    printf("\n Path = %s", url.path);
    printf("\n Query = %s", url.query);
    printf("\n Fragment = %s", url.fragment);
    printf("\n auth = %s", url.auth);
    printf("\n");

    // free memory
    ngx_url_free(&url);

    return 0;
}
