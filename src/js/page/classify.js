require(['../js/common.js'],function(){
	require(['mui','dom','getUid','format','getParams'],function(mui,dom,getUid,format,getParams){
		mui.init();
		
		function init(){
			
			
			//加载数据
			loadData();
			
			
			//添加点击事件
			addEvent();
			
		}
		
		function loadData(){
			//加载分类图标
			loadIcon();
			
			
		}
		
		function loadIcon(){
			getUid(function(uid){
				mui.ajax('/api/getIcon',{
					dataType:'json',
					data:{
						uid:uid
					},
					success:function(res){
						console.log(res);
						if(res.code === 1){
							//渲染icon图标
							renderIcon(res.results);
						}else{
							alert(res.msg)
						}
					},
					error:function(error){
						console.warn(error)
					}
				})
			})
			
		}
		
		//渲染icon图标
		function renderIcon(data){ //[{},{},{}....]     [[{},{},{}....],[]]
			var target = format(data,15);
			
			var str = '';
			
			target.forEach(function(item){
				str += '<div class="mui-slider-item"><ul>'+renderItem(item)+'</ul></div>';
				
				dom('.mui-slider-group').innerHTML = str;
				
				mui('.mui-slider').slider();
			})
		}
		
		function renderItem(data){
			return data.map(function(item){
				return `
					<li>
						<span class="${item.icon_name}"></span>
					</li>
				`
			}).join('')
		}
		
		//添加点击事件
		function addEvent(){
			//点击切换图标
			mui('.mui-slider-group').on('tap','span',function(){
				var cName = this.className;
				
				dom('#target').className = cName;
			})	
			//点击保存
			dom('.save-btn').addEventListener('tap',function(){
				var cType = decodeURI(getParams.status),
					cName = dom('#c-name').value,
					cIcon = dom('#target').className;
				if(!cName){
					alert("分类名为空")
				}else{
					getUid(function(uid){
						mui.ajax('/api/addClassify',{
							dataType:'json',
							type:'post',
							data:{
								cType:cType,
								cName:cName,
								cIcon:cIcon,
								uid:uid
							},
							success:function(res){
								console.log(res);
								if(res.code === 1){
									alert('添加成功');
									location.href="../../page/add-bill.html";
								}else{
									alert(res.msg)
								}
							}
						})
					})
					
				}
			})
		}
		
		init();
	})
})