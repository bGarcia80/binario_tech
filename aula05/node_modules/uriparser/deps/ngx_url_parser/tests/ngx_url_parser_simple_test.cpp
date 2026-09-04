#include "gtest/gtest.h"

extern "C" {
    #include "../ngx_url_parser.h"
}

TEST(ngx_url_parser_simple, CorrectUrl) {
    const char * str = "http://mkaciuba.pl";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithEmptyFragment) {
    const char * str = "http://mkaciuba.pl#";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, "");
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPort) {
    const char * str = "http://mkaciuba.pl:443";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, "443");
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPortFragmentAfter) {
    const char * str = "http://mkaciuba.pl:443#fragment";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, "443");
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, "fragment");
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPortFragmentAfter2) {
    const char * str = "http://mkaciuba.pl:443#";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, "443");
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, "");
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPortQueryAfter) {
    const char * str = "http://mkaciuba.pl:443?query";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, "443");
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, "query");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPortQueryAfter2) {
    const char * str = "http://mkaciuba.pl:443?";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, "443");
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, "");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPort2) {
    const char * str = "http://mkaciuba.pl:4";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, "4");
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPortAndPath) {
    const char * str = "http://mkaciuba.pl:443/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, "443");
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPath) {
    const char * str = "http://mkaciuba.pl/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPath2) {
    const char * str = "http://mkaciuba.pl/X";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/X");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPathAndQuery) {
    const char * str = "http://mkaciuba.pl/?a=2&b[]=1";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.query, "a=2&b[]=1");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPathAndQuery2) {
    const char * str = "http://mkaciuba.pl/d/b/?a=2&b[]=1";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/d/b/");
    ASSERT_STREQ(url.query, "a=2&b[]=1");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPathAndQuery3) {
    const char * str = "https://mkaciuba.pl/d/b?a=2&b[]=1";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/d/b");
    ASSERT_STREQ(url.query, "a=2&b[]=1");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithPathAndFragment) {
    const char * str = "https://mkaciuba.pl/#test";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.fragment, "test");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithQuery) {
    const char * str = "https://mkaciuba.pl?aa";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, "aa");
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithQuery2) {
    const char * str = "https://mkaciuba.pl?";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.query, "");
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithFragment) {
    const char * str = "https://mkaciuba.pl#aa";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.fragment, "aa");
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithRandomQuery) {
    const char * str = "https://mkaciuba.pl/?sdfsdf?sdfsdfsd";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, "sdfsdf?sdfsdfsd");
    ASSERT_STREQ(url.auth, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithauth) {

    const char * str = "https://marcin:a@mkaciuba.pl/?sdfsdf?sdfsdfsd";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, "sdfsdf?sdfsdfsd");
    ASSERT_STREQ(url.auth, "marcin:a");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithauthNoPass) {

    const char * str = "https://marcin:@mkaciuba.pl/?sdfsdf?sdfsdfsd";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, "sdfsdf?sdfsdfsd");
    ASSERT_STREQ(url.auth, "marcin:");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithauthNoUser) {

    const char * str = "https://:pw@mkaciuba.pl/?sdfsdf?sdfsdfsd";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, "sdfsdf?sdfsdfsd");
    ASSERT_STREQ(url.auth, ":pw");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithAllParameters) {

    const char * str = "https://a:pw@mkaciuba.pl:1/?cbf#abc";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.port, "1");
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.fragment, "abc");
    ASSERT_STREQ(url.query, "cbf");
    ASSERT_STREQ(url.auth, "a:pw");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, OnlyPath) {

    const char * str = "/a/b?x=y#test";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.path, "/a/b");
    ASSERT_STREQ(url.fragment, "test");
    ASSERT_STREQ(url.query, "x=y");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, OnlyPath2) {

    const char * str = "/a.txt";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.path, "/a.txt");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, OnlyPathNoSlashAndAll) {

    const char * str = "a/a.txt?test=1#fragment";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.path, "a/a.txt");
    ASSERT_STREQ(url.fragment, "fragment");
    ASSERT_STREQ(url.query, "test=1");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, OnlyPathNoSlash) {

    const char * str = "a/a.txt";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.path, "a/a.txt");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, OnlyPathQuery) {
    const char * str = "1.txt?test1=okok";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.path, "1.txt");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, "test1=okok");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, DuplicatedSlash) {

    const char * str = "http://10.177.51.76:1337/example//dir/hi";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "10.177.51.76");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.path, "/example//dir/hi");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, LongUrl) {

    const char * str = "http://10.177.51.76:1337/v2//v2?y_ac&yr&ffffflllllllllllloooooooooooooooooooongggggggg%d%g$d1S";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "10.177.51.76");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.query, "y_ac&yr&ffffflllllllllllloooooooooooooooooooongggggggg%d%g$d1S");
    ASSERT_STREQ(url.path, "/v2//v2");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlFromExample) {

    const char * str = "https://user:password@mkaciuba.pl:555/path/?query#fragment";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.path, "/path/");
    ASSERT_STREQ(url.fragment, "fragment");
    ASSERT_STREQ(url.query, "query");
    ASSERT_STREQ(url.auth, "user:password");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, FreeMemoryTwoTimes) {

    const char * str = "https://user:password@mkaciuba.pl:555/path/?query#fragment";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ngx_url_free(&url);
    ngx_url_free(&url);
    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ASSERT_STREQ(url.host, NULL);
}

TEST(ngx_url_parser_simple, TestUrl) {

    const char * str = "http://10.177.51.76:1337//example/dir/hi";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);

    ASSERT_EQ(NGX_URL_OK, status);
    ASSERT_STREQ(url.host, "10.177.51.76");
    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.port, "1337");
    ASSERT_STREQ(url.path, "//example/dir/hi");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, Onlyscheme){
    const char * str = "htt://";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, "htt");

    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, NoHost) {
    const char * str = "https:///a";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.host, "");
    ASSERT_STREQ(url.path, "/a");
    ngx_url_free(&url);
}


TEST(ngx_url_parser_simple, EmptyPort) {
    const char * str = "http://host:/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "host");
    ASSERT_STREQ(url.port, "");
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, EmptyPort2) {
    const char * str = "http://host:";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, "http");
    ASSERT_STREQ(url.host, "host");
    ASSERT_STREQ(url.port, "");
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, SimpleUrl) {
    const char * str = "https://www.dreamlab.pl:81/path/index.html";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.host, "www.dreamlab.pl");
    ASSERT_STREQ(url.port, "81");
    ASSERT_STREQ(url.path, "/path/index.html");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithAuth) {
    const char * str = "https://user:password@www.dreamlab.pl:81/path/index.html?arg1=1&arg2=2";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.host, "www.dreamlab.pl");
    ASSERT_STREQ(url.port, "81");
    ASSERT_STREQ(url.path, "/path/index.html");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, "user:password");
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, OnlyFragment) {
    const char * str = "#1fragment";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.fragment, "1fragment");
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, OnlyQuery) {
    const char * str = "?query/";
    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.query, "query/");
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UnderscoreInHost) {
    const char * str = "https://www.dreamlab_.pl:81/path/index.html?arg1=1&arg2=2";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, "https");
    ASSERT_STREQ(url.host, "www.dreamlab_.pl");
    ASSERT_STREQ(url.port, "81");
    ASSERT_STREQ(url.path, "/path/index.html");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, EmptyString) {
    const char * str = "";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithOutProto) {
    const char * str = "//mkaciuba.pl/path";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/path");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, UrlWithOutProto2) {
    const char * str = "//mkaciuba.pl";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, "mkaciuba.pl");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, NULL);
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, PathLikeUrlWithOutProto) {
    const char * str = "///mkaciuba.pl/path";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, "");
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/mkaciuba.pl/path");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, PathWithNumbers) {
    const char * str = "/12345";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/12345");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, PathWithUppercaseLetter) {
    const char * str = "/ABCD";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/ABCD");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, OnlyPathWithSlash) {
    const char * str = "/";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, PathSpecialChar) {
    const char * str = "/^&*";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/^&*");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, PathSpecialCharTwo) {
    const char * str = "/.^&*feed";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/.^&*feed");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, PathSpecialCharTwoNoSlash) {
    const char * str = ".^&*feed";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, ".^&*feed");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}

TEST(ngx_url_parser_simple, QueryAfterPath) {
    const char * str = "/?from=1&to=2";

    ngx_http_url url;
    int status = ngx_url_parser(&url, str);
    ASSERT_EQ(NGX_URL_OK, status);

    ASSERT_STREQ(url.scheme, NULL);
    ASSERT_STREQ(url.host, NULL);
    ASSERT_STREQ(url.port, NULL);
    ASSERT_STREQ(url.path, "/");
    ASSERT_STREQ(url.query, "from=1&to=2");
    ASSERT_STREQ(url.fragment, NULL);
    ASSERT_STREQ(url.auth, NULL);
    ngx_url_free(&url);
}
