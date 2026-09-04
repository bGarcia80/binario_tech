cmake_minimum_required(VERSION 2.8.4)
project(ngx_urlparser)
set(BUILD_TESTS OFF)
option(BUILD_TESTS "Build tests?" OFF)

set(CMAKE_BUILD_TYPE "Release")
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -Wall -fPIC -O1")

add_executable(example ngx_url_parser.c example.c)
add_library(ngx_url_parser STATIC ngx_url_parser.c)

if(BUILD_TESTS)
    add_subdirectory(tests)
endif()
