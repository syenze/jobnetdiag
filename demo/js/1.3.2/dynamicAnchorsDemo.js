;(function() {

    // # define 
    max_x = 126;
    max_y = 64;

    //
    def_width  = 350;
    def_height = 150;

    // 
    def_init_depth = 1;
    def_click_depth = 3;
    def_insert_depth = 1;

    // 
    def_plus_angle = 5;
    def_angle = 0;

    // 
    def_plus_width = 1;

    // 生成済み Model id  配列
	list = [];

    // 生成済み Model id  ハッシュ
    // models = [ ModelID ] = { x:(横軸), y:(縦軸) }
	models = [];

    // 本 position 確定用 Model 管理 ハッシュ
    // position = [ x:(横軸) ] [ y:(縦軸) ] =  mid: (Modelid ) ]
    position = [];

    // 
    connect = [];
    //
    delete_list = [];

    // 
    // 動的アンカー配置設定
    anchors = [[0.2, 0, 0, -1], [1, 0.2, 1, 0], [0.8, 1, 0, 1], [0, 0.8, -1, 0] ],

    exampleColor = '#00f',
    startColor = '#0099ff',
    endColor = '#00f',

    connectorStyle = {
        // グラデーション 
        gradient:{stops:[ [0, startColor], [1, endColor] ]},
        lineWidth:2,
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


    window.jsPlumbDemo = {
        // 初期化処理
            init : function() {

            // Model 配置場所 position の初期化
            jsPlumbDemo.initModelPos();

            jsPlumb.DefaultDragOptions = { cursor: 'pointer', zIndex:2000 };

            var before = ( new Date() ).getTime();
            
            // 初期接続のみ表示
            jsPlumbDemo.initModel(  "NONE" , def_init_depth );

            var after = ( new Date() ).getTime();
            console.log( "connectModel : " + ( after - before ) );


            // 画面全体の Event 付与
            jsPlumbDemo.initGlobalEvent();

        },

        // 画面全体で初期 Event 付与
        // param : void
        // return : void
        initGlobalEvent : function ( ){

            // connection 接続関係表示
            jsPlumb.bind("dblclick", 
                function(connection, originalEvent) { 
                    alert( connection.sourceId + " -> " + connection.targetId); 
                }
            );

            // 臨時追加 プロンプト表示
            $("#add").bind( "click", function(e, ui) {

                var jobs = window.prompt( "input job id ", "" );
                var jlist = jobs.split(',');

                for( var l = 0 ; l < jlist.length; l++ ){
                    jsPlumbDemo.initModel( jlist[l] , def_insert_depth );
                }

            });

        },
        
        insertModel : function ( ){


        },

        // initModel 
        // return void
        initModel : function ( elId , p_depth ){
            
            // console.log( "init depth:" + p_depth );
            var v_depth = p_depth;
            // console.log( "itni list:" + list );

            if( v_depth < 1 ){
                return;
            }

            for( var k = 0 ; k < job_info.length; k++ ){

                if( job_info[k].id == elId ){

                    // console.log( "init job_id:" +  job_info[k].id );

                    if( job_info[k].next != ""){ 
                        //debug  console.log( job_info[k].next );
                        var nexts = [];
                        nexts = job_info[k].next.split(',');
                        for( var l = 0 ; l < nexts.length; l++ ){
                            // モデルの作成 / コネクションの作成
                            jsPlumbDemo.connectModel( nexts[l], job_info[k].id );
                            jsPlumbDemo.initModel( nexts[l] , v_depth - 1 );

                        }
                    }

                    if( job_info[k].pre != ""){ 

                        // console.log( job_info[k].pre ); 

                        var pres = [];
                        pres = job_info[k].pre.split(',');
                        for( var m = 0 ; m < pres.length; m++ ){
                            jsPlumbDemo.connectModel( job_info[k].id, pres[m]  );
                            jsPlumbDemo.initModel( pres[k] , v_depth - 1);
                        }
                    }

                    break;
                }

            }

        },

        // モデルを削除する
        allRemoveModel : function ( elId , depth ){

            console.log( "id:" + elId );
            // console.log( "depth:" + depth );
    

            if( jsPlumbDemo.isDeletedModel( elId ) ){
                delete_list.push( elId );
            }else{
                return ;
            }

            for( var k = 0 ; k < job_info.length; k++ ){

                if( job_info[k].id == elId ){

                    // console.log( job_info[k] );

                    if( job_info[k].next != ""){
                        //debug  console.log( job_info[k].next );
                        var nexts = [];
                        nexts = job_info[k].next.split(',');
                        // console.log( nexts );

                        for( var l = 0 ; l < nexts.length; l++ ){

                            //debug  console.log( jsPlumbDemo.outputLen( depth ) + "n)start" + nexts[l] );

                            // つながりが存在すれば 削除する。
                            if( jsPlumbDemo.isExistConnect( job_info[k].id , nexts[l] ) ){
                                jsPlumbDemo.removeConnect(  job_info[k].id , nexts[l] );
                            }

                            if( jsPlumbDemo.isExistModel( nexts[l] ) ){
                                // 再帰的に対象ファイルをたどって削除していく
                                jsPlumbDemo.allRemoveModel( nexts[l] , depth - 1 );
                            }
                           
                            // console.log( jsPlumbDemo.outputLen( depth ) + "n)end" + nexts[l] );

                        }
                    }

                    if( job_info[k].pre != ""){


                        // console.log( job_info[k].pre );

                        var pres = [];
                        pres = job_info[k].pre.split(',');
                        // console.log( pres );
                        for( var m = 0 ; m < pres.length; m++ ){

                            // console.log( jsPlumbDemo.outputLen( depth ) + "p)start" + pres[m] );

                            // つながりが存在すれば 削除する。
                            if( jsPlumbDemo.isExistConnect( pres[m] , job_info[k].id ) ){
                                jsPlumbDemo.removeConnect(  pres[m] , job_info[k].id );
                            }

                            if( jsPlumbDemo.isExistModel( pres[m] ) ){
                                jsPlumbDemo.allRemoveModel( pres[m] , depth - 1);
                            }

                            // console.log( jsPlumbDemo.outputLen( depth ) + "p)end" + pres[m] );

                        }

                    }

                    // 
                    if( jsPlumbDemo.isExistModel( job_info[k].id ) ){
                        // 自分自信は削除しない
                        jsPlumbDemo.removeModel( job_info[k].id );
                        jsPlumbDemo.removeDeleteList( job_info[k].id );

                    }

                    break;

                }

            }

        },

        // モデルを削除する
        removeNextModel : function ( elId , depth ){

            // console.log( "id:" + elId );

            if( jsPlumbDemo.isDeletedModel( elId ) ){
                delete_list.push( elId );
            }else{
                return ;
            }

            for( var k = 0 ; k < job_info.length; k++ ){

                if( job_info[k].id == elId ){

                    // console.log( job_info[k] );

                    if( job_info[k].next != ""){
                        //debug  console.log( job_info[k].next );
                        var nexts = [];
                        nexts = job_info[k].next.split(',');
                        // console.log( nexts );
                        for( var l = 0 ; l < nexts.length; l++ ){

                            // つながりが存在すれば 削除する。
                            if( jsPlumbDemo.isExistConnect( job_info[k].id , nexts[l] ) ){
                                jsPlumbDemo.removeConnect(  job_info[k].id , nexts[l] );
                            }

                            if( jsPlumbDemo.isExistModel( nexts[l] ) ){
                                // 再帰的に対象ファイルをたどって削除していく
                                jsPlumbDemo.removeNextModel( nexts[l] , depth - 1 );
                            }

                        }
                    }

                    if( job_info[k].pre != ""){

                        // console.log( job_info[k].pre );

                        var pres = [];
                        pres = job_info[k].pre.split(',');
                        // console.log( pres );
                        for( var m = 0 ; m < pres.length; m++ ){

                            // つながりが存在すれば 削除する。
                            if( jsPlumbDemo.isExistConnect( pres[m] , job_info[k].id ) ){
                                jsPlumbDemo.removeConnect(  pres[m] , job_info[k].id );
                            }

                        }

                    }

                    // 
                    if( jsPlumbDemo.isExistModel( job_info[k].id ) ){
                        // 自分自信は削除しない
                        jsPlumbDemo.removeModel( job_info[k].id );
                        jsPlumbDemo.removeDeleteList( job_info[k].id );
                    }

                    break;

                }

            }

        },

        // モデルを削除する
        removePreModel : function ( elId , depth ){

            console.log( "id:" + elId );

            if( jsPlumbDemo.isDeletedModel( elId ) ){
                delete_list.push( elId );
            }else{
                return ;
            }

            for( var k = 0 ; k < job_info.length; k++ ){

                if( job_info[k].id == elId ){

                    if( job_info[k].next != ""){
                        //debug  console.log( job_info[k].next );
                        var nexts = [];
                        nexts = job_info[k].next.split(',');
                        // console.log( nexts );
                        for( var l = 0 ; l < nexts.length; l++ ){

                            // つながりが存在すれば 削除する。
                            if( jsPlumbDemo.isExistConnect( job_info[k].id , nexts[l] ) ){
                                jsPlumbDemo.removeConnect(  job_info[k].id , nexts[l] );
                            }

                        }
                    }

                    if( job_info[k].pre != ""){

                        // console.log( job_info[k].pre );

                        var pres = [];
                        pres = job_info[k].pre.split(',');
                        // console.log( pres );
                        for( var m = 0 ; m < pres.length; m++ ){

                            if( jsPlumbDemo.isExistModel( pres[m] ) ){
                                jsPlumbDemo.removePreModel( pres[m] , depth - 1);
                            }

                            // つながりが存在すれば 削除する。
                            if( jsPlumbDemo.isExistConnect( pres[m] , job_info[k].id ) ){
                                jsPlumbDemo.removeConnect(  pres[m] , job_info[k].id );
                            }

                        }

                    }

                    // 
                    if( jsPlumbDemo.isExistModel( job_info[k].id ) ){
                        // 自分自信は削除しない
                        jsPlumbDemo.removeModel( job_info[k].id );
                        jsPlumbDemo.removeDeleteList( job_info[k].id );
                    }

                    break;

                }

            }
        },

        // モデルを削除する
        removeSingleModel : function ( elId , depth ){

            console.log( "id:" + elId );

            if( jsPlumbDemo.isDeletedModel( elId ) ){
                delete_list.push( elId );
            }else{
                return ;
            }

            for( var k = 0 ; k < job_info.length; k++ ){

                if( job_info[k].id == elId ){

                    if( job_info[k].next != ""){
                        //debug  console.log( job_info[k].next );
                        var nexts = [];
                        nexts = job_info[k].next.split(',');
                        // console.log( nexts );
                        for( var l = 0 ; l < nexts.length; l++ ){

                            // つながりが存在すれば 削除する。
                            if( jsPlumbDemo.isExistConnect( job_info[k].id , nexts[l] ) ){
                                jsPlumbDemo.removeConnect(  job_info[k].id , nexts[l] );
                            }

                        }
                    }

                    if( job_info[k].pre != ""){

                        // console.log( job_info[k].pre );

                        var pres = [];
                        pres = job_info[k].pre.split(',');
                        // console.log( pres );
                        for( var m = 0 ; m < pres.length; m++ ){

                            // つながりが存在すれば 削除する。
                            if( jsPlumbDemo.isExistConnect( pres[m] , job_info[k].id ) ){
                                jsPlumbDemo.removeConnect(  pres[m] , job_info[k].id );
                            }

                        }

                    }

                    // 
                    if( jsPlumbDemo.isExistModel( job_info[k].id ) ){
                        // 自分自信は削除しない
                        jsPlumbDemo.removeModel( job_info[k].id );
                        jsPlumbDemo.removeDeleteList( job_info[k].id );
                    }

                    break;

                }

            }
        },

        // ジョブ接続情報に基づいて、つながりを生成する
        // ジョブがなければ、適切な場所に作成する
        // param next : 接続元 ( job id )
        // param pre : 接続先 ( job id )
        // return 
        connectModel : function ( next, pre ){

                if( jsPlumbDemo.isExistConnect( pre , next ) ){
                    return ;
                }

                // 2つのモデル ( 接続元 と 接続先 )の関係 から 本 position を設定する
                var next_pos = jsPlumbDemo.checkModelPos( next )
                  , pre_pos  = jsPlumbDemo.checkModelPos( pre );
                    
                // 接続元,接続元の場所を確認
                if( next_pos && pre_pos ){ // P1. 接続元の場所あり, 接続先の場所あり

                    // console.log( '' + next_pos + ':' + pre_pos );
                    // 設定 必要なし

                }else if( pre_pos ){ // P2. 接続元の場所あり, 接続先の場所なし

                    // 接続 の場所なし、接続元との関係から場所を探す
                    var mmp = jsPlumbDemo.findModelPos( pre_pos.x + 1, pre_pos.y );
                    jsPlumbDemo.addModel( next , mmp.x , mmp.y );

                }else if( next_pos ){ // P3. 接続元の場所なし、接続先の場所あり

                    // 接続 の場所なし、接続先との関係から場所を探す
                    var mmp = jsPlumbDemo.findModelPos( next_pos.x - 1, next_pos.y );
                    jsPlumbDemo.addModel( pre , mmp.x , mmp.y );

                }else{ // P4. 接続先の場所なし、接続元の場所なし
                    // 接続の場所なし、基準点との関係から場所を探す

                    /** 
                    var default_fmp = { 
                        x:( max_x / 2 + Math.floor( Math.random() * 10 ) % 10 ) , 
                        y: ( max_y / 2 +  Math.floor( Math.random() * 10 ) % 20) 
                    };
                    **/
                    var default_fmp = { x:2 , y:4 };
                    var setting_fmp;

                    // 基準点(8, 8) が未設定の場合は、基準点に接続元を設定する
                    if( list.length < 0 ){
                        jsPlumbDemo.addModel( pre , default_fmp.x , default_fmp.y );
                        setting_fmp = { x:default_fmp.x , y:default_fmp.y };

                    }else{
                        setting_fmp = jsPlumbDemo.findModelPos( default_fmp.x , default_fmp.y );
                        jsPlumbDemo.addModel( pre , setting_fmp.x , setting_fmp.y );
                    }

                    // 接続先の場所なし、接続元（基準点）との関係から場所を探す ( P2 と同じ )
                    var fmp= jsPlumbDemo.findModelPos( setting_fmp.x , setting_fmp.y );
                    jsPlumbDemo.addModel( next , fmp.x , fmp.y );

                }
                // 既に 本 position が 確定している Model については、変更しない。


                // ジョブ同士を接続したことを設定する
                jsPlumbDemo.setConnect( pre , next );


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
        // param def_x : 基準 x 座標
        // param def_y : 基準 y 座標
        // return  ( x : x 座標 , y : y 座標 )
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

                    mod_x = Math.abs ( def_x + Math.floor( width * Math.cos( radian ) ) );
                    mod_y = Math.abs ( def_y + Math.floor( width * Math.sin( radian ) ) );

                    if ( position[mod_x][mod_y] == null && mod_x < max_x && mod_y < max_y &&  mod_x >= 0  && mod_y >= 0 ){

                        //debug console.log( "angle: " + angle + ", radian : " + radian );
                        //debug console.log( "x : " + def_x + " -> " + mod_x  + "px , y : " + def_y + " -> " + mod_y +  "px" );

                        return { x:mod_x, y:mod_y };
                    }

                }

                // それでも 確定できない場合は、幅を広げて探す。
                width += def_plus_width;
            }

        },

        // Model の 配置場所を 返す
        // param job_id ( ジョブ ID )
        // return { x , y } / null
        checkModelPos : function ( model_id ) {

            if( models[model_id] != null ){
                return models[ model_id ];
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
            
            d.innerHTML = "(g" + mod.group_no + ")" 
            + d.innerHTML 
            + "</br>" + mod.boot_process
            + "</br>" + mod.boot_params;

            
            // div#demo DOM 追加
            var objBody = document.getElementById("demo");
            objBody.appendChild(d);

			// var id = '' + ((new Date().getTime())), _d = jsPlumb.CurrentLibrary.getElementObject(d);
			var _d = jsPlumb.CurrentLibrary.getElementObject(d);
			jsPlumb.CurrentLibrary.setAttribute(_d, "id", create_id);

            // DOM の要素に 位置を指定する
            d.style.left = ( 10 + set_x * def_width ) +  'px'; 
            d.style.top  = ( 10 + set_y * def_height ) +  'px'; 

            // Event追加
            jsPlumbDemo.initAnimation( create_id );
       
            // console.log( $("#" + create_id) );

            // リスト登録
            position[set_x][set_y] = create_id;
            models[create_id] = { x:set_x , y:set_y }; 
            
			return {d:d, id:create_id};
        },

        // モデル Event 初期設定
        initAnimation : function( elId ){

            $("#" + elId).bind('dblclick', function(e, ui) {

                // 接続モデルの作成
                jsPlumbDemo.initModel( elId , def_click_depth );

                // 画面内スクロールの移動
                jsPlumbDemo.smoothScroll( elId , e.pageX, e.pageY );

            });

            // コンテキストメニューを表示
            $("#" + elId ).contextMenu(

                { menu: 'select' , inSpead: 10 , outSpead : 0 },
                function( action , el , pos ){

                    if ( action == 'del' ){
                        delete_list = [];
                        jsPlumbDemo.removeSingleModel( elId , 3);
                    }else if( action == 'nextdel' ){
                        delete_list = [];
                        jsPlumbDemo.removeNextModel( elId , 3);
                    }else if( action == 'predel' ){
                        delete_list = [];
                        jsPlumbDemo.removePreModel( elId , 3);
                    }else if( action == 'alldel' ){
                        delete_list = [];
                        jsPlumbDemo.allRemoveModel( elId , 3);
                    }else{

                    }

                }

             );

        },


        // オブジェクト を中央に移動
        smoothScroll : function ( elId , x , y ){

                def_x = 1;
                def_y = 1;

                scrollX = scrollY = 0;

                scrollX = x - ( $(window).width() / 2 );
                scrollY = y - ( $(window).height() / 2 );

                window.scrollTo( Math.floor( scrollX / def_x ), Math.floor( scrollY / def_y ) );

        },

        // DOM 追加
        // add_id : オブジェクトのジョブID
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
        },


        // DOM 削除
        // param elId : ジョブID
        // return : void
        removeModel : function ( elId ){

            console.log( "delete : " + elId );
            list_item = $.inArray( elId , list ); 
			list.splice( list_item , 1 );

            var pos = jsPlumbDemo.checkModelPos( elId );  

            if( pos != null ){
                position[pos.x][pos.y] = null;
            }

            models[elId] = null ; 

            jsPlumb.removeAllEndpoints( elId );
            // jsPlumb.detachAll( elId );
            // jsPlumb.hide( elId );

            $("#"+ elId).remove();

        },
        
        // 削除済みか　あるいは 削除対象になっているか
        isDeletedModel : function ( job_id ){

            if( ! jsPlumbDemo.isExistModel( job_id )){
                return false;
            }
           
            // 削除対象に追加済み
            if( $.inArray( job_id , delete_list ) != -1){
                return false;
            }

            // 未削除であり、且つ 削除対象にもふくまれていない
            return true;

        },

        // 既に Model が存在するかチェックする
        // param job_id : ジョブID
        // return bootlean :true / false
        isExistModel : function( job_id ){

            if( $.inArray( job_id , list ) == -1){
                return false;
            }

            return true;

        },

        // 接続が存在するか確認する
        // return ture / false
        isExistConnect : function( from , to  ){

            if( $.inArray( from + "->" + to , connect ) == -1 ){
                return false;
            }

            return true;

        },
        
        // つながりを保持する
        // モデルどおしの　コネクションを貼る
        // return void
        setConnect : function ( from , to ){

            // console.log( "connect :" + from + " -> " + to );
            connect.push( from + "->" + to );

            // Window (DOM) の 接続元 ( pre ) と 接続先 ( next ) を id を指定して 接続する
            jsPlumb.connect({ source:from, target:to }, aConnection );

        },

        // つながりを削除する。
        removeConnect : function ( from , to ){

            console.log( "delete connect :" + from + " -> " + to );

            connect_item = $.inArray( from + "->" + to , connect ); 
            connect.splice( connect_item , 1 );

        },

        removeDeleteList : function ( elId ){
           
            delete_item = $.inArray( elId , delete_list ); 
            delete_list.splice( delete_item , 1 );

        }

	};
})();
