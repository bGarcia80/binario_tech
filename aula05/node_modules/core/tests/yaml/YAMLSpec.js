var edgeRule = hereDoc(function() {/*!
www.onet.pl:
- rule: MobileRedirectRule
  args:
      url: http://lajt.onet.pl/redir.rd?akcja=domobilnej&url=http%3A%2F%2Fonet.pl%2F
- rule: TryCacheRule
  args:
    cache:
      headerPrefix: "latest!headers!"
      bodyPrefix: "latest!body!"
    regenerate:
      regeneratingTimeout: 30000
      loaderTimeout: 30000
      delay: 5000
- rule: UncompressRule
- rule: SquidRule
- rule: BreakRule
- rule: OnetSgQueryHttpRule
  args: 
    timeout: 65000
- rule: CacheRule
- rule: UncompressRule
- rule: SquidRule
*/});
   
var yamlStringifyRule = hereDoc(function() {/*!
- www.onet.pl:
    - rule: MobileRedirectRule
      args:
        url: "http://lajt.onet.pl/redir.rd?akcja=domobilnej&url=http%3A%2F%2Fonet.pl%2F"
    - rule: TryCacheRule
      args:
        cache:
          headerPrefix: "latest!headers!"
          bodyPrefix: "latest!body!"
        regenerate:
          regeneratingTimeout: 30000
          loaderTimeout: 30000
          delay: 5000
    - rule: UncompressRule
    - rule: SquidRule
    - rule: BreakRule
    - rule: OnetSgQueryHttpRule
      args:
        timeout: 65000
    - rule: CacheRule
    - rule: UncompressRule
    - rule: SquidRule
*/});

var obj = [
    {
        "www.onet.pl": [
            {
                "rule": "MobileRedirectRule",
                "args": {
                    "url": "http://lajt.onet.pl/redir.rd?akcja=domobilnej&url=http%3A%2F%2Fonet.pl%2F"
                }
            },
            {
                "rule": "TryCacheRule",
                "args": {
                    "cache": {
                        "headerPrefix": "latest!headers!",
                        "bodyPrefix": "latest!body!"
                    },
                    "regenerate": {
                        "regeneratingTimeout": 30000,
                        "loaderTimeout": 30000,
                        "delay": 5000
                    }
                }
            },
            {
                "rule": "UncompressRule"
            },
            {
                "rule": "SquidRule"
            },
            {
                "rule": "BreakRule"
            },
            {
                "rule": "OnetSgQueryHttpRule",
                "args": {
                    "timeout": 65000
                }
            },
            {
                "rule": "CacheRule"
            },
            {
                "rule": "UncompressRule"
            },
            {
                "rule": "SquidRule"
            }
        ]
    }
];

function hereDoc(f) {
    return f.toString().replace(/^[^\/]+\/\*!\n?/, '').replace(/\*\/[^\/]+$/, '');
}


describe('YAML', function () {
    var YAML;

    beforeEach(function () {
        YAML = require('../../lib/yaml/YAML.js').YAML;
    });

    it('require', function () {
        expect(YAML).toBeTruthy();
    });

    it('parse', function () {
        expect(YAML.parse(hereDoc(edgeRule))).toEqual(obj);
    });

    it('stringify ', function () {
        var yamlString = YAML.stringify(obj);
        var compareString = hereDoc(yamlStringifyRule);
        expect(yamlString).toEqual(compareString);
    });

    it('should be reversable', function () {
        var yamlString = YAML.stringify(obj);
        expect(obj).toEqual(YAML.parse(yamlString).pop());
    });
})
