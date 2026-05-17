const h={doubao:{name:"豆包(Ark)",apiUrl:"https://ark.cn-beijing.volces.com/api/v3",models:["doubao-pro-4k","doubao-pro-32k","doubao-pro-128k"],defaultModel:"doubao-pro-32k"},qianwen:{name:"通义千问",apiUrl:"https://dashscope.aliyuncs.com/compatible-mode/v1",models:["qwen-turbo","qwen-plus","qwen-max"],defaultModel:"qwen-plus"},deepseek:{name:"DeepSeek",apiUrl:"https://api.deepseek.com/v1",models:["deepseek-chat","deepseek-coder"],defaultModel:"deepseek-chat"},wenxin:{name:"百度文心",apiUrl:"https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat",models:["ernie-bot-4","ernie-bot-turbo","ernie-bot"],defaultModel:"ernie-bot-4"},custom:{name:"自定义OpenAI兼容接口",apiUrl:"",models:[],defaultModel:""}};function u(t,o,e={}){const{style:a="formal",length:i="medium",addOpinion:c=!1,addIntro:l=!0}=e,p={formal:"正式严谨，适合新闻资讯类发布",casual:"口语化，通俗易懂，像和朋友聊天一样",analysis:"深度分析，有观点有深度，条理清晰",sharp:"犀利评论，一针见血，观点鲜明"},m={short:"500字左右的短文",medium:"1000字左右的中等长度文章",long:"1500字左右的长文"},n=p[a]||p.formal,r=m[i]||m.medium;let s=`你是一个专业的新闻改写编辑。请根据以下原文，改写为一篇全新的原创文章。

改写要求：
1. 风格：${n}
2. 长度：${r}
3. 必须与原文有显著差异，不能简单替换几个词
4. 需要重新组织文章结构，变换表达方式
5. 保留核心事实和信息准确性
6. 标题也需要改写，更有吸引力`;return l&&(s+=`
7. 需要添加一个吸引人的开头引导段落`),c&&(s+=`
8. 在适当位置加入独到的个人观点和评论`),s+=`

原文标题：${t}

原文内容：
${o}

请按以下格式输出改写结果：
【标题】改写后的标题
【正文】改写后的正文内容`,s}async function f(t,o,e,a={}){const{apiKey:i,apiUrl:c,model:l}=t;if(!i)throw new Error("请先配置API Key");const p=u(o,e,a),m=[{role:"system",content:"你是一个专业的新闻改写编辑，擅长将新闻文章改写为高质量的原创内容。"},{role:"user",content:p}];try{const n=await fetch("/api/proxy-ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({apiUrl:c,apiKey:i,model:l,messages:m,temperature:.8})});if(!n.ok){const s=await n.json().catch(()=>({}));throw new Error(s.error||`AI接口返回错误: ${n.status}`)}const r=await n.json();if(r.choices&&r.choices[0]&&r.choices[0].message){const s=r.choices[0].message.content;return d(s)}else{if(r.result)return d(r.result);throw new Error("AI返回数据格式异常")}}catch(n){throw n.message.includes("Failed to fetch")||n.message.includes("NetworkError")?new Error("网络连接失败，请检查网络或API地址配置"):n}}function d(t){let o="",e=t;const a=t.match(/【标题】(.+?)(?:\n|【)/);a&&(o=a[1].trim());const i=t.match(/【正文】([\s\S]+)$/);if(i&&(e=i[1].trim()),!o){const c=t.split(`
`).filter(l=>l.trim());c.length>1&&(o=c[0].replace(/^[【\[]/,"").replace(/[】\]]$/,"").trim(),e=c.slice(1).join(`
`).trim())}return{title:o,content:e}}async function w(t,o=6){try{const e=await fetch(`/api/images?keyword=${encodeURIComponent(t)}&count=${o}`);if(!e.ok)throw new Error("图片搜索失败");return(await e.json()).images||[]}catch(e){return console.error("图片搜索错误:",e),[]}}export{h as a,f as c,w as s};
