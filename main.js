(async () => {
  const fetch = (await import('node-fetch')).default;
  const fs = require('fs').promises;
  const { HttpsProxyAgent } = require('https-proxy-agent');
  const path = require('path'); 
  const readline = require('readline');
  const crypto = require('crypto'); 

  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  function askQuestion(query) {
      return new Promise((resolve) => rl.question(query, (answer) => resolve(answer)));
  }

  async function main() {
      const accessToken = await askQuestion("请输入您的 accessToken :");

      let headers = {
          'Accept': 'application/json, text/plain, */*',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
      };

      const browserIdFilePath = path.join(__dirname, 'browser_ids.json');

      async function coday(url, method, payloadData = null, proxy) {
          try {
              const agent = new HttpsProxyAgent(proxy);
              let response;
              const options = {
                  method: method,
                  headers: headers,
                  agent: agent
              };

              if (method === 'POST') {
                  options.body = JSON.stringify(payloadData);
                  response = await fetch(url, options);
              } else {
                  response = await fetch(url, options);
              }

              return await response.json();
          } catch (error) {
              console.error('代理出错:', proxy);
          }
      }

      function generateBrowserId() {
          return crypto.randomUUID();  
      }

      async function loadBrowserIds() {
          try {
              const data = await fs.readFile(browserIdFilePath, 'utf-8');
              return JSON.parse(data);
          } catch (error) {
              return {};  
          }
      }

      async function saveBrowserIds(browserIds) {
          try {
              await fs.writeFile(browserIdFilePath, JSON.stringify(browserIds, null, 2), 'utf-8');
              console.log('已将浏览器ID保存到文件。');
          } catch (error) {
              console.error('保存浏览器ID出错:', error);
          }
      }

      async function getBrowserId(proxy) {
          const browserIds = await loadBrowserIds();
          if (browserIds[proxy]) {
              console.log(`为代理 ${proxy} 使用现有的 browser_id`);
              return browserIds[proxy];  
          } else {
              const newBrowserId = generateBrowserId();
              browserIds[proxy] = newBrowserId;  // 为代理保存新的 browser_id
              await saveBrowserIds(browserIds);  
              console.log(`为代理 ${proxy} 生成新 browser_id: ${newBrowserId}`);
              return newBrowserId;
          }
      }

      function getCurrentTimestamp() {
          return Math.floor(Date.now() / 1000);  
      }

      async function pingProxy(proxy, browser_id, uid) {
          const timestamp = getCurrentTimestamp();
          const pingPayload = { "uid": uid, "browser_id": browser_id, "timestamp": timestamp, "version": "1.0.0" };

          while (true) {
              try {
                  const pingResponse = await coday('https://api.aigaea.net/api/network/ping', 'POST', pingPayload, proxy);
                  console.log(`代理 ${proxy} 的 ping 成功:`, pingResponse);

                  // 检查得分
                  if (pingResponse.data && pingResponse.data.score < 50) {
                      console.log(`代理 ${proxy} 的得分低于 50，正在重新认证...`);

                      // 重新认证并使用新 browser_id 重新开始 ping
                      await handleAuthAndPing(proxy);
                      break; 
                  }
              } catch (error) {
                  console.error(`代理 ${proxy} 的 ping 失败:`, error);
              }
              await new Promise(resolve => setTimeout(resolve, 600000));  // 等待10分钟后再执行下一个 ping
          }
      }

      async function handleAuthAndPing(proxy) {
          const payload = {};
          const authResponse = await coday("https://api.aigaea.net/api/auth/session", 'POST', payload, proxy);
          
          if (authResponse && authResponse.data) {
              const uid = authResponse.data.uid;
              const browser_id = await getBrowserId(proxy);  // 获取或生成此代理的唯一 browser_id
              console.log(`代理 ${proxy} 验证成功，uid: ${uid}, browser_id: ${browser_id}`);

              // 开始 ping
              pingProxy(proxy, browser_id, uid);
          } else {
              console.error(`代理 ${proxy} 的认证失败`);
          }
      }

      try {
          // 从 proxy.txt 文件中读取代理列表
          const proxyList = await fs.readFile('proxy.txt', 'utf-8');
          const proxies = proxyList.split('\n').map(proxy => proxy.trim()).filter(proxy => proxy);

          if (proxies.length === 0) {
              console.error("在 proxy.txt 中未找到代理");
              return;
          }

          const tasks = proxies.map(proxy => handleAuthAndPing(proxy));

          await Promise.all(tasks);

      } catch (error) {
          console.error('发生错误:', error);
      }
  }

  main();
})();
