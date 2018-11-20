require(['../js/common.js'],function(){
	require(['mui','dom','getUid','format','picker','dtpicker'],function(mui,dom,getUid,format){
		mui.init();
		
		function init(){
			//初始化时间
			initDate();
			//添加点击事件
			addEvent();
			//获取数据
			getData();
		}
		
		//获取数据
		function getData(){
			getUid(function(uid){
				//获取所有分类
				getClassify(uid);
			})
		}
		
		
		
		
		var type = '支出';
		
		//获取分类
		function getClassify(uid){
			mui.ajax('/api/allClassify',{
				dataType:'json',
				data:{
					uid:uid
				},
				success:function(res){
					console.log(res);
					if(res.code === 1){
						//渲染分类数据
						render(res.results);
					}
				}
			})
		}
		
		/**
		*  {
			"支出":[{},{}]
			"收入":[{},{}]
			}
		* 
		*/
	   
	    var formatObj = {};
		
		function render(data){
			
			data.forEach(function(item){
				if(!formatObj[item.c_type]){
					formatObj[item.c_type]= [];
				}
				
				formatObj[item.c_type].push(item);
			})
			//渲染分类dl
			renderType(formatObj);
			console.log(formatObj);
		}
		//渲染分类mui-slider-item
		function renderType(data){
			// data[type]   [[],[]]
			
			console.log(format(data[type].slice(0),8))
			
			var finalData = format(data[type].slice(0),8);
			
			var str = '';
			
			finalData.forEach(function(item){
				str+= '<div class="mui-slider-item"><div>'+renderDl(item)+'</div></div>'
			})
			
			dom('.mui-slider-group').innerHTML = str;
			
			var custom = `
				<dl class="go-new">
					<dt>
						<span class="mui-icon mui-icon-plus"></span>
					</dt>
					<dd>自定义</dd>
				</dl>
			`;
			
			var items = dom('.mui-slider-group').querySelectorAll('.mui-slider-item'),
				lastItem = items[finalData.length-1];
			
			if(lastItem.querySelector('div').children.length % 8 == 0){
				str += '<div class="mui-slider-item"><div>'+custom+'</div></div>';
				dom('.mui-slider-group').innerHTML = str;
			}else{
				lastItem.querySelector('div').innerHTML = lastItem.querySelector('div').innerHTML + custom;
			}
			
			items[0].querySelectorAll('dl')[0].classList.add('active');
			
			var slider = mui('.mui-slider').slider();
			
			slider.gotoItem(0,0); //第一参数：下标    第二个参数：时间
		}
		
		//渲染dl
		
		function renderDl(data){
			return data.map(function(v){
				return `
					<dl data-cid="${v.cid}">
						<dt>
							<span class="${v.c_icon}"></span>
						</dt>
						<dd>${v.c_name}</dd>
					</dl>
				`
			}).join('')
		}
		
		//初始化时间
		
		var dtpicker = null,
			curYear = new Date().getFullYear(),
			curMonth = new Date().getMonth() + 1,
			curDay = new Date().getDate(),
			_time = dom('.time');
			
		function initDate(){
			dtpicker = new mui.DtPicker({
				type:'date'
			})
			_time.innerHTML = curYear + '-' + curMonth + '-' + curDay;
		}
		
		//添加账单
		function addBill(){
			
// 			var uid = params.uid,
// 			cid = params.cid,
// 			timer = params.create_time,
// 			type = params.type,
// 			money = params.money;

			var cid = dom('.classify-list').querySelector('.active').getAttribute('data-cid'),
					time = dom('.time').innerHTML,
					money = dom('.ipt-money').innerHTML; 

			getUid(function(uid){
				mui.ajax('/api/addBill',{
					dataType:'json',
					data:{
						uid:uid,
						cid:cid,
						create_time:time,
						money:money
					},
					type:'post',
					success:function(res){
						console.log(res);
						if(res.code === 1){
							location.href="../../index.html"
						}else{
							alert(res.msg);
						}
					},
					error:function(error){
						console.warn(error);
					}
				})
			})
		}
		
		function addEvent(){
			//选择时间
			dom('.time').addEventListener('tap',function(){
				dtpicker.show(function(selectItems){
					_time.innerHTML = selectItems.text;
				})
			})
			//点击键盘
			mui('.keyboard').on('tap','span',function(){
				var val = this.innerHTML,
					_iptMoney = dom('.ipt-money'),
					iptVal =_iptMoney.innerHTML ;
				
				if(val === 'x'){
					console.log("=====",iptVal.slice(0,iptVal.length-1))
					_iptMoney.innerHTML = iptVal.slice(0,iptVal.length-1);
					return
				}else if(val === '完成'){
					//添加账单
					addBill();
					return
				}
				
				if(iptVal === '0.00'){
					_iptMoney.innerHTML = val;
				}else if(iptVal.indexOf('.') != -1 && val === '.'){
					_iptMoney.innerHTML = iptVal;
				}else if(iptVal.indexOf('.') != -1 && iptVal.split('.')[1].length == 2){
					_iptMoney.innerHTML = iptVal;
				}else{
					_iptMoney.innerHTML = iptVal + val;
				}
				
			})
			
			
			//点击分类
			mui('.classify-list').on('tap','dl',function(){
				var dlList = Array.from(dom('.classify-list').querySelectorAll('dl'));
				for(var i = 0;i<dlList.length;i++){
					dlList[i].classList.remove('active');
				}
				this.classList.add('active');
			})
			
			//切换收支类型
			mui('.tab-list').on('tap','span',function(){
				
				var spans = Array.from(dom('.tab-list').querySelectorAll('span'));
				
				for(var i = 0;i<spans.length;i++){
					spans[i].classList.remove('active');
				}
				this.classList.add('active');
				
				type = this.innerHTML;
				
				//切换收入和支出
				renderType(formatObj);
				
			})
			
			//去新建分类界面
			mui('.mui-slider-group').on('tap','.go-new',function(){
				location.href="../../page/classify.html?status="+type;
			})
		}
		
		init();  //主入口
	})
})