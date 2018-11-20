require(['./js/common.js'],function(){
	require(['mui','dom','echarts','getUid','picker','poppicker','dtpicker'],function(mui,dom,echarts,getUid){
		mui.init();
		
		
		function init(){
			var offCanvasInner = dom('.mui-inner-wrap');
			offCanvasInner.addEventListener('drag', function(event) {
				event.stopPropagation();
			});
			//添加点击
			addEvent();
			//初始化滚动
			initScroll();
			//初始化date
			initDate();
			//初始化图表
			initTable();
			//加载数据
			loadData();
		}
		
		//加载数据
		function loadData(){
			//加载分类的数据
			loadClassify();
			//加载账单的数据
			loadBill();
		}
		
		//获取账单列表
		function loadBill(condition,selectType) {
			var timeType = status === 'month' ? 1 : 2, //按月查还是按年查
				time = _selectDate.innerHTML; //当前选择的时间
				
			getUid(function(uid){
				mui.ajax('/api/getBill', {
					data: {
						uid: uid,
						time: time,
						timeType: timeType,
						selectType:selectType,
						condition:condition
					},
					success: function(res) {
						console.log(res);
						if (res.code === 1) {
							//渲染账单
							renderBill(res.results);
						} else {
							alert(res.msg)
						}
					}
				})
			})
			
		}
		
		var _monthWrap = dom('.month-wrap'),
			_yearWrap = dom('.year-wrap'),
			_totalPay = dom('.total-pay'),
			_totalCom = dom('.total-com');
			
		var totalMonthPay = 0,	//按月显示的总支出
			totalMonthCom = 0,  //按月显示的总收入
			totalYearPay = 0,   //按年显示的总支出
			totalYearCom = 0;   //按年显示的总收入
		
		//渲染账单
		function renderBill(data){
			if(data.length){
				if(status === 'month'){
					//渲染月
					renderMonthBill(data);
				}else{
					//渲染年
					renderYearBill(data);
				}
			}else{
				if(status === 'month'){
					_monthWrap.innerHTML = "暂无账单显示";
				}else{
					_yearWrap.innerHTML = "暂无账单显示";
				}
			}
		}
		
		//渲染月的
		
		function renderMonthBill(data){
			//[{},{}] 
			  
			  // {
// 				  "11-17":{
// 					  "title":"11-17",
// 					  "list":[],
// 					  "totalPay":0
// 				  },
// 				 "11-18":{
// 					  "title":"11-18",
// 					  "list":[],
// 					  "totalPay":0
// 				  }
// 			  }

			totalMonthPay = 0;
			totalMonthCom = 0;

			var monthObj = {};
			data.forEach(function(item){
				var time = item.create_time.substr(5,5);
				console.log(time);
				if(!monthObj[time]){
					monthObj[time] = {
						title:time,
						list:[],
						totalPay:0
					}
				}
				monthObj[time].list.push(item);
				if(item.c_type === '支出'){
					monthObj[time].totalPay += item.money;
				}
			})
			var monthArr = [];
			
			for(var i in monthObj){
				monthArr.push(monthObj[i])
			}
			
			var str = '';
			monthArr.forEach(function(item){
				str += `
					<div class="day-item">
						<div class="day-title">
							<div class="t-l">
								<span class="mui-icon mui-icon-weixin"></span>
								${item.title}
							</div>
							<div class="t-r">花费: <span class="item-pay">${item.totalPay}</span></div>
						</div>
						<ul class="mui-table-view">`;
				str += renderBillLi(item.list);			
				str += `</ul></div>`;
			})
			
			_monthWrap.innerHTML = str;
			
			_totalPay.innerHTML = "本月花费:"+totalMonthPay+"元";
			
			_totalCom.innerHTML = "本月收入:"+totalMonthCom+"元";
		}
		
		//渲染li
		
		function renderBillLi(data){
			return data.map(function(item){
				if(status === 'month'){
					if(item.c_type=== '支出'){
						totalMonthPay += item.money;
					}else{
						totalMonthCom += item.money;
					}
				}else{
					if(item.c_type=== '支出'){
						totalYearPay += item.money;
					}else{
						totalYearCom += item.money;
					}
				}
				return 	`
					<li class="mui-table-view-cell bill-item">
						<div class="mui-slider-right mui-disabled">
							<a class="mui-btn mui-btn-red" data-id="${item.lid}" data-money="${item.money}" data-type="${item.c_type}" >删除</a>
						</div>
						<div class="mui-slider-handle">
							<dl>
								<dt>
									<span class="${item.c_icon}"></span>
								</dt>
								<dd>${item.c_name}</dd>
							</dl>
							<span class="${item.c_type==='支出' ? 'red' : 'green'}">${item.money}</span>
						</div>
					</li>
				`
			}).join('')
		}
		
		//渲染年
		function renderYearBill(data){
			
			totalYearPay = 0;
			totalYearCom = 0;
			
			var yearObj = {};
			
			data.forEach(function(item){
				var time = item.create_time.substr(5,2);
				if(!yearObj[time]){
					yearObj[time] = {
						title:time,
						list:[],
						totalPay:0,
						totalCom:0,
						surplus:0
					}
				}
				
				yearObj[time].list.push(item);
				if(item.c_type == '支出'){
					yearObj[time].totalPay += item.money;
					yearObj[time].surplus -= item.money;
				}else{
					yearObj[time].totalCom += item.money;
					yearObj[time].surplus += item.money;
				}
			})
			
			var yearArr = [];
			
			for(var i in yearObj){
				yearArr.push(yearObj[i])
			}
			
			var yearStr = '';
			
			yearArr.forEach(function(item){
				yearStr += `
					<li class="mui-table-view-cell mui-collapse">
						<a class="mui-navigate-right" href="#">
							<ol class="month-title">
								<li>
									<span class="mui-icon mui-icon-weixin"></span>
									${item.title}
								</li>
								<li class="red">
									<span>花费</span>
									<span class="item-pay">${item.totalPay}</span>
								</li>
								<li class="green">
									<span>收入</span>
									<span class="item-com">${item.totalCom}</span>
								</li>
								<li class="gray">
									<span>结余</span>
									<span class="item-surplus">${item.surplus}</span>
								</li>
							</ol>
						</a>
						<div class="mui-collapse-content">
							<ul class="mui-table-view">`;
							
				yearStr += renderBillLi(item.list);		
						
				yearStr +=	`</ul>
						</div>
					</li>
				`;
				
				_yearWrap.querySelector('ul').innerHTML = yearStr;
				
				_totalPay.innerHTML = "本年花费:"+totalYearPay+"元";
				
				_totalCom.innerHTML = "本年收入:"+totalYearCom+"元";
				
			})
		}
		
		//加载分类的数据
		function loadClassify(){
			getUid(function(uid){
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
			})
		}
		
		//渲染分类
		var formatObj = {};
		function render(data){
			data.forEach(function(item){
				if(!formatObj[item.c_type]){
					formatObj[item.c_type]= [];
				}
				
				formatObj[item.c_type].push(item);
			})
			console.log(formatObj);
			
			dom('.pay').innerHTML = renderLi(formatObj['支出']);
			
			dom('.income').innerHTML = renderLi(formatObj['收入']);
			
		}
		
		//渲染li
		function renderLi(data){
			return data.map(function(item){
				return `<li data-cid="${item.cid}">${item.c_name}</li>`
			}).join('')
		}
		
		//初始化图表
		function initTable(){
			mui('.mui-slider').slider();
			var myChart = echarts.init(dom('#main'));
			
			var option = {
				series: [{
					name: '访问来源',
					type: 'pie',
					radius: ['40%', '55%'],
					data: [{
							value: 335,
							name: '直达'
						},
						{
							value: 310,
							name: '邮件营销'
						},
						{
							value: 234,
							name: '联盟广告'
						},
						{
							value: 135,
							name: '视频广告'
						},
						{
							value: 1048,
							name: '百度'
						},
						{
							value: 251,
							name: '谷歌'
						},
						{
							value: 147,
							name: '必应'
						},
						{
							value: 102,
							name: '其他'
						}
					]
				}],
				 graphic:{
					type:'text',
					left:'center',
					top:'center',
					style:{
						text:'花费', //使用“+”可以使每行文字居中
						textAlign:'center',
						font:'italic bolder 16px cursive',
						fill:'#000',
						width:30,
						height:30
					}
				}
			};

			// 使用刚指定的配置项和数据显示图表。
			myChart.setOption(option);
		}
		
		//初始化date
		var picker = null,
			dtPicker = null,
			curYear = new Date().getFullYear(), //年
			curMonth = new Date().getMonth() + 1,
			_selectDate = dom('.select-date'),
			status = 'month'; //月
		
		function initDate(){
			picker = new mui.PopPicker();
			picker.setData([
				{
					value:'month',
					text:'月',
				},
				{
					value:'year',
					text:'年',
				}
			]);
			
			_selectDate.innerHTML = curYear + '-' + curMonth;
			
			dtPicker = new mui.DtPicker({
				type:'month'
			}); 
			

		}
		
		//初始化scroll
		function initScroll(){
			mui('.mui-scroll-wrapper').scroll({
				deceleration: 0.0005 //flick 减速系数，系数越大，滚动速度越慢，滚动距离越小，默认值0.0006
			});
		}
		
		function addEvent(){
			//点击打开
			dom('#open-aside').addEventListener('tap',function(){
				mui('.mui-off-canvas-wrap').offCanvas('show');
			})

			//点击月年
			dom('.select-month').addEventListener('tap',function(){
				var that = this;
				var _monthWrap = dom('.month-wrap'),
					_yearWrap = dom('.year-wrap');
				 picker.show(function (selectItems) {
					that.innerHTML = selectItems[0].text;
					status = selectItems[0].value;
					if(status === 'month'){
						_selectDate.innerHTML = curYear + '-' + curMonth;
						
						dom("h5[data-id='title-m']").style.display = 'inline-block';
						dom("h5[data-id='title-y']").style.width = '50%';
						dom(".mui-picker[data-id='picker-m']").style.display = 'block';
						dom(".mui-picker[data-id='picker-y']").style.width = '50%';
						
						_monthWrap.style.display = 'block';
						_yearWrap.style.display = 'none';
					}else{
						_selectDate.innerHTML = curYear;
						dom("h5[data-id='title-m']").style.display = 'none';
						dom("h5[data-id='title-y']").style.width = '100%';
						dom(".mui-picker[data-id='picker-m']").style.display = 'none';
						dom(".mui-picker[data-id='picker-y']").style.width = '100%';
						
						_monthWrap.style.display = 'none';
						_yearWrap.style.display = 'block';
					}
					//加载账单
					loadBill();
				})
				
				
			})
			
			//点击选择時間
			_selectDate.addEventListener('tap',function(){
				var that = this;
				dtPicker.show(function (selectItems) { 
					curYear = selectItems.y.text;
					curMonth = selectItems.m.text
					if(status === 'month'){
						that.innerHTML = selectItems.text;
					}else{
						that.innerHTML = curYear;
					}
					//加载账单
					loadBill();
				})
			})
			
			//点击关闭侧边栏
			dom('#close-aside').addEventListener('tap',function(){
				mui('.mui-off-canvas-wrap').offCanvas('close');
			})
			
			//点击tab切换
			mui('.tab-list').on('tap','span',function(){
				
				var spans = Array.from(dom('.tab-list').querySelectorAll('span'));
				
				for(var i = 0;i<spans.length;i++){
					spans[i].classList.remove('active');
				}
				this.classList.add('active');
				
				var id = this.getAttribute('data-id');
				
				var _billWrap = dom('.bill-wrap'),
					_tableWrap = dom('.table-wrap');
				if(id === '0'){
					_billWrap.style.display = 'block';
					_tableWrap.style.display = 'none';
				}else{
					_billWrap.style.display = 'none';
					_tableWrap.style.display = 'block';
				}
			})
			
			//去添加账单界面
			dom('.go-bill').addEventListener('tap',function(){
				location.href="../../page/add-bill.html";
			})
			
			//点击支出收入类型
			var typeLis = Array.from(dom('.type').querySelectorAll('li'));  //收入和支出
			mui('.type').on('tap','li',function(){
				
				var id = this.getAttribute('data-id'); //选中的是支出还是收入
				
				var classifyUls = dom('.aside-type').querySelectorAll('.classify');
				
				var lis = Array.from(classifyUls[id].querySelectorAll('li')); 
				
				if(this.className.indexOf('active') != -1){
					this.classList.remove('active');
					for(var i=0;i<lis.length;i++){
						lis[i].classList.remove('active');
					}
				}else{
					this.classList.add('active');
					for(var i=0;i<lis.length;i++){
						lis[i].classList.add('active');
					}
				}
				
				var conditionArr = [];
				
				var conditionEles = Array.from(dom('.classify-wrap').querySelectorAll('.active'))
				
				for(var i=0;i<conditionEles.length;i++){
					conditionArr.push(conditionEles[i].innerHTML)
				}
				
				loadBill(conditionArr,2);
				
			})
			
			//点击分类
			mui('.classify').on('tap','li',function(){
				
				var id = this.parentNode.getAttribute('data-id');
				
				if(this.className.indexOf('active') != -1){
					this.classList.remove('active');
					typeLis[id].classList.remove('active');
				}else{
					this.classList.add('active');
					
					var activelisLen = this.parentNode.querySelectorAll('.active').length;  //有active类的li的长度
					
					var lisLen = this.parentNode.querySelectorAll('li').length;
					
					if(activelisLen == lisLen){
						typeLis[id].classList.add('active');
					}
				}
				
				var conditionArr = [];
				
				var conditionEles = Array.from(dom('.classify-wrap').querySelectorAll('.active'))
				
				for(var i=0;i<conditionEles.length;i++){
					conditionArr.push(conditionEles[i].innerHTML)
				}
				
				loadBill(conditionArr,2);
				
			})
			
			
			//点击删除
			mui('.bill-wrap').on('tap','.mui-btn',function(){
				var elem = this;
				var li = elem.parentNode.parentNode;
				var btnArray = ['确认', '取消'];
				mui.confirm('确认删除该账单吗？', '提示', btnArray, function(e) {
					if (e.index == 0) {
						var lid = elem.getAttribute('data-id'),
							money = elem.getAttribute('data-money'),
							type = elem.getAttribute('data-type');
							
						mui.ajax('/api/delBill',{
							dataType:'json',
							data:{
								lid:lid
							},
							success:function(res){
								console.log(res);
								if(res.code === 1){
									
									if(status === 'month'){
										var targetEle = li.parentNode.parentNode;
										if(type === "支出"){
											totalMonthPay -= money;
											_totalPay.innerHTML = "本月花费："+totalMonthPay +"元";
											targetEle.querySelector('.item-pay').innerHTML -= money;
										}else{
											totalMonthCom -= money;
											_totalCom.innerHTML = "本月收入：" + totalMonthCom +"元";
										}
									}else{
										var targetEle = li.parentNode.parentNode.parentNode;
										if(type === "支出"){
											totalYearPay -= money;
											_totalPay.innerHTML = "本年花费："+totalYearPay +"元";
											targetEle.querySelector('.item-pay').innerHTML -= money;
										}else{
											totalYearCom -= money;
											_totalCom.innerHTML = "本年收入：" + totalYearCom +"元";
											targetEle.querySelector('.item-com').innerHTML -= money;
										}
										
										targetEle.querySelector('.item-surplus').innerHTML = targetEle.querySelector('.item-com').innerHTML - targetEle.querySelector('.item-pay').innerHTML;
									}
									
									if(li.parentNode.children.length > 1){
										li.parentNode.removeChild(li);
									}else{
										
										if(status === "month"){
											_monthWrap.removeChild(li.parentNode.parentNode);
										}else{
											_yearWrap.querySelector('ul').removeChild(li.parentNode.parentNode.parentNode)
										}
										
									}
								}
							}
						})
					} else {
						setTimeout(function() {
							mui.swipeoutClose(li);
						}, 0);
					}
				});
			})
			
		}
		
		
		
		init();  //页面的主入口
	})
})