;(function() {

    // # define 
    max_x = 64;
    max_y = 32;

    //
    def_width  = 350;
    def_height = 150;

    // 
    def_plus_angle = 5;
    def_angle = 0;

    // 
    def_plus_width = 1;

    // 
    // 動的アンカー配置設定
    anchors = [[0.2, 0, 0, -1], [1, 0.2, 1, 0], [0.8, 1, 0, 1], [0, 0.8, -1, 0] ],

    exampleColor = '#00f',
    startColor = '#0099ff',
    endColor = '#00f',

    connectorStyle = {
        // グラデーション 
        gradient:{stops:[ [0, startColor], [1, endColor] ]},
        lineWidth:5,
        strokeStyle:exampleColor
    },

    startpoint = ["Rectangle", {width:25, height:21} ],
    endpoint = ["Dot", {radius:8} ],
    endpointStyle = { fillStyle:exampleColor },
    aConnection = {
        endpoint:endpoint,				
        endpointStyle:endpointStyle,
        paintStyle : connectorStyle,
        dynamicAnchors:anchors,
        overlays:[ ["Arrow", { location:0.8, width:25, fillStyle:'#ff0000' } ] ]
    };

    // 生成済み Model id  配列
	list = [];

    // 本 position 確定用 Model 管理 ハッシュ
    // position = [ x:(横軸) ] [ y:(縦軸) ] =  mid: (Modelid ) ]
    position = [];

    window.csvload = {
        loadCSV : function(path) {
          var httpObj = csvload.createXMLHttpRequest(csvload.handleResult);
          if (httpObj) {
            httpObj.open("GET", path, true);
            httpObj.send(null);
          }
        },
        handleResult : function() {
          if ((this.readyState == 4) && (this.status == 200)) {
            var text = csvload.getAjaxFilter()(this.responseText);
            csvData = csvload.parseCSV(text);

            //ここに取得したcsvの処理を書く。ここではテーブルを表示。
            var result = "<table>";
            for (var i = 0; i < csvData.length; i++) {
              result += "<tr>";
              for (var j = 0; j < csvData[i].length; j++){
              result += "<td>";
              result += csvData[i][j];
              result += "</td>";
              }
              result += "</tr>";
            }
            result += "</table>";
            document.getElementById("result").innerHTML = result;
          }
        },
        parseCSV : function(str) {
          var CR = String.fromCharCode(13);
          var LF = String.fromCharCode(10);
          //ここはCSVの改行コードによってCR,LFを使い分ける必要がある。
          var lines = str.split(LF);
          var csvData = new Array();

          for (var i = 0; i < lines.length; i++) {
            var cells = lines[i].split(",");
            if( cells.length != 1 ) csvData.push(cells);
          }
          return csvData;
        },
        createXMLHttpRequest : function(cbFunc) {
          var XMLhttpObject = null;
          try {
            XMLhttpObject = new XMLHttpRequest();
          } catch(e) {
            try {
              XMLhttpObject = new ActiveXObject("Msxml2.XMLHTTP");
            } catch(e) {
              try {
                XMLhttpObject = new ActiveXObject("Microsoft.XMLHTTP");
              } catch(e) {
                return null;
              }
            }
          }
          if (XMLhttpObject) XMLhttpObject.onreadystatechange = cbFunc;
          return XMLhttpObject;
        },
        getAjaxFilter : function() {
          if (navigator.appVersion.indexOf("KHTML") > -1) {
            return function(t) {
              var esc = escape(t);
              return (esc.indexOf("%u") < 0 && esc.indexOf("%") > -1) ? decodeURIComponent(esc) : t
            }
          } else {
            return function(t) {
              return t
            }
          }
        },
    };

	window.jsPlumbDemo = {
        // 初期化処理
		init : function() {

            // Model 配置場所 position の初期化
            jsPlumbDemo.initModelPos();

			jsPlumb.DefaultDragOptions = { cursor: 'pointer', zIndex:2000 };

            // csvload.loadCSV( 'http://www33039u.sakura.ne.jp/tfukasaw/jsplumb-demo/demo/static/job_wait.dat' );



            // 自分自身が 接続先のみ、接続先にならないModel つなげる
            // FIXME N x N x N のループ
            for( var n = 0 ; n < jobwait.length; n++ ){
                jsPlumbDemo.reachModel( jobwait[n] );
            }

            // 他とつながりのないジョブも忘れないように
            // FIXME N のループ
            for( var i = 0 ; i < jobwait.length; i++ ){
                jsPlumbDemo.connectModel( jobwait[i] );
            }

        },

        // search_id を元に つながりのある ジョブを再帰的につなげていく
        reachModel : function ( wait ){

            // とりあえずつなげる
            jsPlumbDemo.connectModel( wait );

            // pre の探索
            for( var m = 0; m < jobwait.length; m++ ){

                if( jobwait[m].next == wait.pre && ! jsPlumbDemo.checkModelPos( jobwait[m].pre ) ){
                    jsPlumbDemo.reachModel( jobwait[m] );
                }

                if( jobwait[m].pre == wait.pre && ! jsPlumbDemo.checkModelPos( jobwait[m].next ) ){
                    jsPlumbDemo.reachModel( jobwait[m] );
                }

            }

            // next の探索 
            for( var l = 0; l < jobwait.length; l++ ){

                if( jobwait[l].pre == wait.next && ! jsPlumbDemo.checkModelPos( jobwait[l].next ) ){
                    jsPlumbDemo.reachModel( jobwait[l] );
                }

                if( jobwait[l].next == wait.next && ! jsPlumbDemo.checkModelPos( jobwait[l].pre ) ){
                    jsPlumbDemo.reachModel( jobwait[l] );
                }
            }

        },

        // data ( 接続先、接続元 ) の情報に基づいて、つながりを生成する
        // data : 
        connectModel : function ( data ){

                var obj = data;



                // console.log( "pre:" + obj.pre + ",next:" + obj.next );
                
                // 2つのモデル ( 接続元 と 接続先 )の関係 から 本 position を設定する
                
                var next_pos = jsPlumbDemo.checkModelPos( obj.next )
                  , pre_pos  = jsPlumbDemo.checkModelPos( obj.pre );
                    
                // 接続元,接続元の場所を確認
                if( next_pos && pre_pos ){ // P1. 接続元の場所あり, 接続先の場所あり

                    // console.log( '' + next_pos + ':' + pre_pos );
                    // 設定 必要なし

                }else if( pre_pos ){ // P2. 接続元の場所あり, 接続先の場所なし

                    // 接続 の場所なし、接続元との関係から場所を探す
                    var mmp = jsPlumbDemo.findModelPos( pre_pos.x + 1, pre_pos.y );
                    console.log( list.length + ") new " + obj.next + " findModelPos =  x:" + mmp.x + ",y:" + mmp.y + " for " + obj.pre + " (" + pre_pos.x + "," + pre_pos.y + ")" );
                    jsPlumbDemo.addModel( obj.next , mmp.x , mmp.y );

                }else if( next_pos ){ // P3. 接続元の場所なし、接続先の場所あり

                    // 接続 の場所なし、接続先との関係から場所を探す
                    var mmp = jsPlumbDemo.findModelPos( next_pos.x - 1, next_pos.y );
                    console.log( list.length + ") new " + obj.pre + " findModelPos =  x:" + mmp.x + ",y:" + mmp.y + " for " + obj.next + " ( " + next_pos.x + "," + next_pos.y + ")" );
                    jsPlumbDemo.addModel( obj.pre , mmp.x , mmp.y );

                }else{ // P4. 接続先の場所なし、接続元の場所なし
                    // 接続の場所なし、基準点との関係から場所を探す

                    var default_fmp = { x:( max_x / 2 + Math.floor( Math.random() * 10 ) % 10 ) , y: ( max_y / 2 +  Math.floor( Math.random() * 10 ) % 20) };
                    // var default_fmp = { x:2 , y:2 };
                    var setting_fmp;

                    // 基準点(8, 8) が未設定の場合は、基準点に接続元を設定する
                    if( list.length < 0 ){
                        console.log( list.length + ") first new " + obj.pre + " findModelPos =  x:" + default_fmp.x + ",y:" + default_fmp.y + "for zero point ."  );
                        jsPlumbDemo.addModel( obj.pre , default_fmp.x , default_fmp.y );
                        setting_fmp = { x:default_fmp.x , y:default_fmp.y };

                    }else{
                        setting_fmp = jsPlumbDemo.findModelPos( default_fmp.x , default_fmp.y );
                        console.log( list.length + ") new " + obj.pre + " findModelPos =  x:" + setting_fmp.x + ",y:" + setting_fmp.y + " for " + "random (" + default_fmp.x + "," + default_fmp.y + ")" );
                        jsPlumbDemo.addModel( obj.pre , setting_fmp.x , setting_fmp.y );
                    }

                    // 接続先の場所なし、接続元（基準点）との関係から場所を探す ( P2 と同じ )
                    var fmp= jsPlumbDemo.findModelPos( setting_fmp.x , setting_fmp.y );
                    console.log( list.length + ") new " + obj.next + " findModelPos =  x:" + fmp.x + ",y:" + fmp.y + " for " + obj.pre + " (" + setting_fmp.x + "," + setting_fmp.y + ")" );
                    jsPlumbDemo.addModel( obj.next , fmp.x , fmp.y );

                }
                // 既に 本 position が 確定している Model については、変更しない。

                console.log( "connect :" + obj.pre + " -> " + obj.next );
                // Window (DOM) の 接続元 ( pre ) と 接続先 ( next ) を id を指定して 接続する
                jsPlumb.connect({ source:obj.pre, target:obj.next }, aConnection );

        },

        // 格納場所を設定する.
        setModelPos : function ( data, mod_x , mod_y ){

            position[mod_x][mod_y] = data.id;
            
            var hoge =  data.obj.getElementsByTagName("strong");
            hoge[0].innerHTML = '' + data.id; // + '(' + mod_x + ':' + mod_y + ')';
          
            var fix_x = 0, fix_y = 0;

            if ( mod_y % 2 ){
                // fix_x = 100;
            }

            data.obj.style.left = ( 10 + mod_x * def_width  - fix_x ) +  'px'; 
            data.obj.style.top  = ( 10 + mod_y * def_height - fix_y ) +  'px'; 

            // console.log( '' + data.id  + ', top :' + data.obj.style.top + ',left :' + data.obj.style.left );

            // return void
        },

        // 接続元 ( or 基準点 ) からの最適な場所を設定する.
        // 設定された場所 ( x , y ) を返す。
        findModelPos : function ( def_x , def_y ){

            // 基準点を設定して置く
            var mod_x = def_x,
                mod_y = def_y;            

            // 
            var width = 1;

            while( 1 ){

                // P0. 基準点 
                mod_x = def_x; 
                mod_y = def_y; 

                if ( position[mod_x][mod_y] == null && mod_x < max_x && mod_y < max_y &&  mod_x >= 0  && mod_y >= 0 ){
                    return { x:mod_x, y:mod_y };
                }

                // 角度
                var angle = 0;

                for ( angle = 0; angle < 360 ; angle+= def_plus_angle ){

                    // P1. 設定点 
                    radian = ( angle + def_angle ) * 3.14 / 180;

                    mod_x = def_x + Math.floor( width * Math.cos( radian ) );
                    mod_y = def_y + Math.floor( width * Math.sin( radian ) );

                    if ( position[mod_x][mod_y] == null && mod_x < max_x && mod_y < max_y &&  mod_x >= 0  && mod_y >= 0 ){

                        console.log( "angle: " + angle + ", radian : " + radian );
                        console.log( "x : " + def_x + " -> " + mod_x  + "px , y : " + def_y + " -> " + mod_y +  "px" );

                        return { x:mod_x, y:mod_y };
                    }

                }

                // それでも 確定できない場合は、幅を広げて探す。
                width += def_plus_width;
            }

        },

        // Model の 配置場所を 返す
        // FIXME N x N の 計算 
        checkModelPos : function ( model_id ) {

            for ( x = 0; x < max_x ; x++ ){

                for( y = 0; y < max_y; y++ ){

                    if( position[x][y] == model_id ){

                        return {x:x,y:y};

                    }
                }
            }

            return null;
        },

        // 格納場所のデータ初期化
        initModelPos : function (){
            for ( x = 0; x < max_x ; x++ ){
                position[x] = [];
                for( y = 0; y < max_y; y++ ){
                    position[x][y] = null;
                }
            }
        },

        // DOM 作成
		// this is overridden by the YUI demo.
        // create_id : オブジェクト id 
        // set_x     : オブジェクト x 座標
        // set_y     : オブジェクト y 座標
        // return    : 配列 ( d:オブジェクト, id: ID )
        createModel : function( create_id, set_x, set_y ) {

            // クラスター 判定 初期化
            var clkb = " cloff";
            // 実行状況 初期化
            var exec = " fin";
            // ジョブ情報 初期化
            var mod = {};

            // 作成ジョブ情報 検索
            for( var i = 0; i < job_info.length; i++ ){
                if( job_info[i].id == create_id){

                    mod = job_info[i];

                    // クラスター処理 判定有無
                    if(  job_info[i].cluster_kb == 1 ){
                        clkb = " clon";
                    }

                    // 実行状況有無
                    if(  job_info[i].exec_flg  == 1 ){
                       exec  = " ready";
                    }else if (  job_info[i].exec_flg  == 2  ){
                       exec  = " run";
                    }else if (  job_info[i].exec_flg  == 3  ){
                       exec  = " error";
                    }

                    break;
                }
            };

			var d = document.createElement("div");
			d.className = "window " + clkb + exec;

            // Model に ラベル要素を追加してみた
			var st = document.createElement("strong");
            // ラベル追加
            st.innerHTML = "" +  create_id ;
            // st.className = "label";
            d.appendChild(st);
            
            d.innerHTML = "(" + list.length + ")" 
            + d.innerHTML 
            + "</br>" + mod.group_no
            + "</br>" + mod.boot_process;
            // + "</br>" + mod.boot_params;

            // div#demo DOM 追加
            var objBody = document.getElementById("demo");
            objBody.appendChild(d);

			// var id = '' + ((new Date().getTime())), _d = jsPlumb.CurrentLibrary.getElementObject(d);
			var _d = jsPlumb.CurrentLibrary.getElementObject(d);
			jsPlumb.CurrentLibrary.setAttribute(_d, "id", create_id);

            // DOM の要素に 位置を指定する
            d.style.left = ( 10 + set_x * def_width ) +  'px'; 
            d.style.top  = ( 10 + set_y * def_height ) +  'px'; 

            // リスト登録
            position[set_x][set_y] = create_id;
            
			return {d:d, id:create_id};
        },

        // DOM 追加
        // add_id : オブジェクト
        // set_x  : オブジェクトの x 座標
        // set_y  : オブジェクトの y 座標
        // return : 配列 ( obj: オブジェクト, id: オブジェクト id )
        addModel : function( add_id, set_x , set_y ) {

            // 既に Model が存在する場合
            if( list.indexOf( add_id ) > -1 ){
                // console.log( "found :" + add_id );
                var add_obj = document.getElementById( add_id );
                return { obj:add_obj, id:add_id };
            };

            // DOM 作成
			var info = jsPlumbDemo.createModel( add_id, set_x, set_y );

            // Model 可動設定
			jsPlumb.draggable(info.id);

			list.push(info.id);

            return { obj:info.d, id:info.id };
        }
	};
})();
