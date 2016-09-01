











var gwStat = {
	meta:{
	"fetch":{
		"userId": {"type":"javascript", "get":function(){ 
			var mhash = gwDataLayer("mail_hash");
			if(mhash)
			{
				if(mhash=="n/a" || mhash=="")
					return null;
				else
					return mhash;
			}
			else
				return null;
		}},
		"email": {"type":"javascript", "get":function(){ 
			if(window.sessionStorage) 
			{
				if(location.pathname=="/account/login")
					sessionStorage.setItem("gwCustLogin", true);
				else if(sessionStorage.getItem("gwCustLogin"))
				{
					jQuery.get("https://www.linio.com.co/account/profile-edit", function(htm) {
						var htmsplt = htm.split('autocomplete="email" value="');
						if(htmsplt.length > 1)
						{
							var mailsplt = htmsplt[1].split('"');
							sessionStorage.setItem("gwCustEmail", mailsplt[0]);
						}
					});
					sessionStorage.removeItem("gwCustLogin");
				}
				else if(sessionStorage.getItem("gwCustEmail"))
				{
					return sessionStorage.getItem("gwCustEmail");
				}
				else
					return null;
			}
			else
				return null;
		}},
		"url": {"type":"javascript", "get":function(){
			return jQuery("[property='og:url']").attr("content");
		}},
		"availability": {"type":"javascript", "get":function(){
			var avail = jQuery("[itemprop='availability']").attr("href");
			return avail=="http://schema.org/OutOfStock"?-1:1;
		}},
		"title": {"type":"javascript", "get":function(){ return gwDataLayer("product_name"); }},
		"brand": {"type":"javascript", "get":function(){ return gwDataLayer("brand"); }},
		"price": {"type":"javascript", "get":function(){ 
			var splprice = gwDataLayer("special_price");
			return splprice?splprice:gwDataLayer("price"); 
		}},
		"listPrice": {"type":"javascript", "get":function(){ return gwDataLayer("price"); }},
		"image": {"type":"javascript", "get":function(){ return jQuery("[property='og:image']").attr("content"); }},
		"category": {"type":"javascript", "get":function(){
			var ctg = gwDataLayer("category_full");
			return ctg?ctg.split("/").join(">"):ctg;
		}}
	},
	"checkout":{
		"url":{"type":"urimatch", "success":"/checkout/success"}
	},
	"callback":{"type":"javascript", "get":function(rsp){}},
	"trigger":{"delay":4000}
},
	pixelId:"363aeba1-71e6-4450-a555-b5665d7975c7",
	sessionId:"5136020d-a9be-4dd2-bd1e-840f8f625f04",
	data:null,
	domain:"linio.com.co",
	base:"https://mailrecipe-live.appspot.com",
	update:function(dt){},
	send:function(){},
	getSessionId:function()
	{
		var sessId = gwReadCookie("gwMailrecipeId");
		sessId = sessId&&sessId.trim()==""?null:sessId;
		if(sessId)
			return sessId;
		else
		{
			gwCreateCookie("gwMailrecipeId",  mailrecipe.sessionId, 1/24);
			return mailrecipe.sessionId;
		}
	},
	fill:function()
	{
		var prms = {};
		var fth = this.meta.fetch;
		for(var mkey in fth)
		{
			try {
				var mval = fth[mkey];
				var vl = mval["get"]();
				prms[mkey] = vl;
			}
			catch (e) {
				console.error("Invalid value for "+mkey+". Reason: "+e);
			}
		}
		prms.sessionId = mailrecipe.getSessionId();
		this.data = prms;
	}
};
var mailrecipe = gwStat;

function gwCreateCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function gwReadCookie(k){return(document.cookie.match('(^|; )'+k+'=([^;]*)')||0)[2]}

function gwPost(prms) {
	var postdata = "callback=gwCallback";
	if(prms)
		prms.pixelId = gwStat.pixelId;
	for(var nm in prms)
		if(prms[nm])
			postdata += "&"+nm+"="+encodeURIComponent(prms[nm]);
	postdata += "&nocache="+new Date().getTime();
	var scriptEl = document.createElement('script');
	var endurl = gwStat.base+"/send/"+gwStat.domain+"?"+postdata;
	scriptEl.setAttribute("src", endurl);
	document.body.appendChild(scriptEl);
}

function gwCallback(rslt) {
	if(gwStat.meta.callback && gwStat.meta.callback.get){
		try{
			gwStat.meta.callback.get(rslt);
		}
		catch(err) {
		}
	}
}

function gwDataLayer(nm, obj) {
	var ctx = obj?obj:dataLayer;
	if(ctx && ctx.constructor == Array)
	{
		for(var i = 0; i < ctx.length; i++)
		{
			var dtlyr = ctx[i];
			if(dtlyr[nm])
				return dtlyr[nm];
			else if(dtlyr && (dtlyr.constructor == Array || dtlyr.constructor == Object))
			{
				var val = gwDataLayer(nm, dtlyr);
				if(val) return val;
			}
		}
	}
	else if(ctx && ctx.constructor == Object)
	{
		if(ctx[nm])
			return ctx[nm];
		for(var ctxnm in ctx)
		{
			var ctxval = ctx[ctxnm];
			if(ctxval && (ctxval.constructor == Array || ctxval.constructor == Object))
			{
				var val = gwDataLayer(nm, ctxval);
				if(val) return val;
			}
		}
	}
	return null;
}

function gwVisit() {
	gwStat.fill();
	gwPost(gwStat.data);
	return true;
}

function gwCart() {
	var url = gwStat.meta.fetch.url.get();
	if(url)
	{
		var prms = {"url":url, "type":"cart", "sessionId":mailrecipe.getSessionId()};
		gwPost(prms);
	}
}

function gwBought() {
	var prms = {"type":"checkout", "sessionId":mailrecipe.getSessionId()};
	gwPost(prms);
}

function gwEncode(str) {
	var encarr = [];
	for(var i = 0; i < str.length; i++)
		encarr.push(str.charCodeAt(i));
	return encarr.join(",");
}

function gwDecode(str) {
	var deccarr = [];
	var arr = eval("(["+str+"])");
	for(var i = 0; i < arr.length; i++)
		deccarr.push(String.fromCharCode(arr[i]));
	return deccarr.join("");
}

function gwHashCode(str) {
  var hash = 0, i, chr, len;
  if (str.length === 0) return hash;
  for (i = 0, len = str.length; i < len; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

if(!console) console = {log:function(){}, dir:function(){}, error:function(){}};


(function() {
	var trg = gwStat.meta.trigger?gwStat.meta.trigger:{"delay":100};
	var dly = trg.delay;
	var attempts = 0;
	var trgfn = function()
	{
		try{
			var rs = gwVisit();
			attempts = attempts + 1;
			if(rs==false && attempts<3)
				setTimeout(trgfn, dly);
		}
		catch(err) {
		}
	};
	setTimeout(trgfn, dly);
	setTimeout(function(){
		if(gwStat.meta.cart && gwStat.meta.cart.register){
			try{
				gwStat.meta.cart.register();
			}
			catch(err) {
			}
		}
	}, dly);
})();


