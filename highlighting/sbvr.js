(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['ometa-js/lib/codemirror-ometa/highlighter', '../sbvr-parser', 'css!./sbvr'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(
			require('ometa-js/lib/codemirror-ometa/highlighter'),
			require('../sbvr-parser')
		);
	} else {
		// Browser globals
		factory(root.codeMirrorOmetaHighlighter, root);
	}
}(this, function (codeMirrorOmetaHighlighter, SBVRParser) {
	codeMirrorOmetaHighlighter(SBVRParser.SBVRParser, 'sbvr', 'text/sbvr', {enableLineByLineParsing: true});
}));
