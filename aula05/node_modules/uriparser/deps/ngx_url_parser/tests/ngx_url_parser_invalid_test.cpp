/*
* Tests for invalid urls
*/

#include "gtest/gtest.h"

extern "C" {
    #include "../ngx_url_parser.h"
}

TEST(ngx_url_parser_invalid, SW_HOST_INVALID_IP) {
    const char * str = "http://[::192.#9.5.5]/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_invalid, SW_SCHEMA_INVALID2) {
    const char * str = ":8181";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_invalid, SW_SCHEMA_INVALID3){
    const char * str = ":8181/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_invalid, SW_SCHEMA_SLASH_INVALID){
    const char * str = "htt:8";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}


TEST(ngx_url_parser_invalid, SW_HOST_IP_INVALID){
    const char * str = "htt://[FEDC:BA98:7654:3210:FEDC:BA98:7654:3210";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_invalid, SW_CHECK_URI_PERC_INVALID){
    const char * str = "http://example.com%%";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_invalid, IncorrectUrl) {
    const char * str = "https:;";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ngx_url_free(&url);
    ASSERT_EQ(NGX_URL_INVALID, status);
}

TEST(ngx_url_parser_invalid, IncorrectUrl3NoPassNoUser) {
    const char * str = "http://:host/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_invalid, UrlInvalidTwoAt) {

    const char * str = "https://user:password@@mkaciuba.pl:555/path/?query#fragment";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_invalid, InvalidPathTylda){
    const char * str = "http://example.com~mkaciuba/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_invalid, PortNotNumber){
    const char * str = "http://[::192.9.5.5]:80a4";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_INVALID, status);

    ngx_url_free(&url);
}
