/*
 *  This file contains the JS that handles the first init of each jQuery demonstration, and also switching
 *  between render modes.
 */
// jsPlumb の init 処理
// はじめに処理して、実行される。
jsPlumb.bind("ready", function() {

	// chrome fix.
	document.onselectstart = function () { return false; };				

    // render mode
	var resetRenderMode = function(desiredMode) {
		var newMode = jsPlumb.setRenderMode(desiredMode);
		$(".rmode").removeClass("selected");
		$(".rmode[mode='" + newMode + "']").addClass("selected");
		var disableList = (newMode === jsPlumb.VML) ? ".rmode[mode='canvas'],.rmode[mode='svg']" : ".rmode[mode='vml']"; 
		$(disableList).attr("disabled", true);				

        // jsPlumb オブジェクトの生成 . 初期化
		jsPlumbDemo.init();

	};
     
	$(".rmode").bind("click", function() {
		var desiredMode = $(this).attr("mode");
		if (jsPlumbDemo.reset) jsPlumbDemo.reset();
		jsPlumb.reset();
		resetRenderMode(desiredMode);					
	});

	resetRenderMode(jsPlumb.CANVAS);

    
    $("#sample_table").find("tr").each( function() {
        console.log( "tr" ); 
        $(this).find("th").each( function(){
            console.log( $(this).find("th:first-child") ); 
        });
    });

});

