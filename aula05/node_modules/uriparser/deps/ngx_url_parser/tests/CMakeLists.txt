set(NGX_URL_TESTS_COVERAGE OFF)

option(NGX_URL_TESTS_COVERAGE "Generate code coverage" OFF)
find_package(GTest REQUIRED)
find_package(Threads REQUIRED)

include_directories(${GTEST_INCLUDE_DIRS})

set(TEST_FILES 
    ngx_url_parser_simple_test.cpp
    ngx_url_parser_invalid_test.cpp
    ngx_url_parser_test.cpp
    main.cpp)

add_executable(unit_tests ${TEST_FILES})

target_link_libraries(unit_tests ${CMAKE_THREAD_LIBS_INIT})
target_link_libraries(unit_tests ${GTEST_BOTH_LIBRARIES})
target_link_libraries(unit_tests ngx_url_parser)

enable_testing()
add_test(A unit_tests)

if(NGX_URL_TESTS_COVERAGE)
    set(CMAKE_BUILD_TYPE "Debug")
    set_target_properties(unit_tests  PROPERTIES COMPILE_FLAGS    "-c -fmessage-length=0 -fprofile-arcs -ftest-coverage")
    set_target_properties(ngx_url_parser PROPERTIES COMPILE_FLAGS    "-c -fmessage-length=0 -fprofile-arcs -ftest-coverage")
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g  -O0 -fprofile-arcs -ftest-coverage")
    include(../CMake/CodeCoverage.cmake)
    setup_target_for_coverage_cobertura(coverage unit_tests coverage_report)
endif()
