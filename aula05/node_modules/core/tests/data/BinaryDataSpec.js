describe('BinaryData', function(){
	var BinaryData, Iconv;
	it('requirements', function(){
		BinaryData = require('../../lib/index.js').data.BinaryData;
		expect(BinaryData).not.toBeNull();
		
		Iconv = require('iconv').Iconv;
		
		expect(Iconv).not.toBeNull();
	});
	
	it('creation', function(){
		var data = new BinaryData("text data", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8);
		expect(data).not.toBeNull();
		expect((data instanceof BinaryData)).toBeTruthy();
		expect(data.getEncoding()).toEqual(BinaryData.Encoding.TEXT);
		expect(data.getCharacterEncoding()).toEqual(BinaryData.CharacterEncoding.UTF8);
	});
	
	it('convertion', function(){
		//
		var dataString = "Test data in UTF8 ąężźć";
		var bdUTF8 = new BinaryData(dataString, BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8)
		expect(bdUTF8.toUTF8String()).toEqual(dataString);
		expect(bdUTF8.toString()).toEqual(dataString);
		expect(bdUTF8.toBuffer().toString()).toEqual(dataString);
		
		var buff = new Buffer(dataString);
		
		var bdISO = new BinaryData("", BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.ISO_8859_2);
		bdISO.setData(buff, BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8);
		expect(bdISO.toUTF8String()).toEqual(dataString);
		expect(function(){
			bdISO.toBuffer()
		}).toThrow(BinaryData.Exception.CONVERTION_ERROR);
		expect(function(){
			bdISO.toString()
		}).toThrow(BinaryData.Exception.CONVERTION_ERROR);
		
		bdISO = new BinaryData("", BinaryData.Encoding.BINARY, BinaryData.CharacterEncoding.ISO_8859_2);
		bdISO.setData(buff, BinaryData.Encoding.TEXT, BinaryData.CharacterEncoding.UTF8);
		expect(bdISO.toUTF8String()).toEqual(dataString)
		
		var expectation = new Buffer((new Iconv(BinaryData.CharacterEncoding.UTF8, BinaryData.CharacterEncoding.ISO_8859_2).convert(buff))).toString('base64');
		expect(bdISO.toString()).toEqual(expectation);
		
		expectation = (new Iconv(BinaryData.CharacterEncoding.UTF8, BinaryData.CharacterEncoding.ISO_8859_2).convert(buff));
		expect(bdISO.toBuffer().toString()).toEqual(expectation.toString());
	});
});