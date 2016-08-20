const http=require('http'),
	  cheerio=require('cheerio'),
	  colors=require('colors'),
	  baseUrl='http://nodejs.cn/doc/node/';

let promiseGetInfo=getReptilePages(baseUrl),
	urls=[],
	fetchArray=[];

/*获取页面标题、获取子页面地址*/
promiseGetInfo.then(function(val){
	filterPages(val);//得到所有url地址
	
	urls.length=4;//url留前4个

	/*把每个子页面get后的promise放入数组里*/
	urls.forEach(function(id){
		fetchArray.push(getReptilePages(baseUrl+id));
	});
	
	/*每个子页面的promise都返回reslove之后，将过滤出来的信息打印出来*/
	Promise.all(fetchArray).then(function(pages){
		let pageData=[];
		pages.forEach(function(html){
			pageData.push(filterSubPages(html));
		});
		printInfo(pageData);
	});
});

/*主页面里获取子页面的url*/
function filterPages(html){
	let $=cheerio.load(html),
		nodeTit=$('h1').text(),
		nodeList=$('#apicontent ul li a');
	nodeList.each(function(){
		urls.push($(this).attr('href'));
	});
}

/*过滤子页面，获取对应信息*/
function filterSubPages(html){
	let $=cheerio.load(html),
		nodeSubTit=$('h1').text(),
		nodeSubApi=$('#toc ul li ul li a'),
		allData={title:nodeSubTit,total:[]};
	nodeSubApi.each(function(){
		allData.total.push($(this).text())
	});
	return allData;
}

/*get页面内容后返回promise对象，当then的时候将html内容传递过去*/
function getReptilePages(url){
	return new Promise(function(resolve,reject){
		http.get(url,function(res){
			let html='';
			res.on('data',function(data){
				html+=data;
			});
			res.on('end',function(){
				resolve(html);
			});
		}).on('error',function(e){
			reject(e);
		});
	});
}

/*打印获取的内容*/
function printInfo(data){
	data.forEach(function(item){
		console.log('title---'+item.title.yellow);
		item.total.forEach(function(item){
			console.log('api---'+item.magenta);
		});
	});
}