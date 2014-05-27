define(['codemirror-ometa/highlighter', '../sbvr-parser', 'css!./sbvr'], function(codeMirrorOmetaHighlighter, SBVRParser) {
	codeMirrorOmetaHighlighter(SBVRParser, 'sbvr', 'text/sbvr', {enableLineByLineParsing: true});
});
