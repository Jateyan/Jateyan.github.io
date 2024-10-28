/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "09205da04d646ce11de50a718d06c612"
  },
  {
    "url": "assets/css/0.styles.66d684e8.css",
    "revision": "9e79f2ae8329ebab3e41ebe1b62e79f1"
  },
  {
    "url": "assets/img/1653118922924.72d846fb.png",
    "revision": "72d846fb69746976a4d772fb9e591d71"
  },
  {
    "url": "assets/img/1653119053628.69b5bb13.png",
    "revision": "69b5bb133d2236a6f2c6c21ddda32313"
  },
  {
    "url": "assets/img/home-bg.7b267d7c.jpg",
    "revision": "7b267d7ce30257a197aeeb29f365065b"
  },
  {
    "url": "assets/img/iconfont.36767f3e.svg",
    "revision": "36767f3efa2e4c880f42a42e8b2075b0"
  },
  {
    "url": "assets/js/1.04272eff.js",
    "revision": "b08fd06cede2ff2f74bc78a2739a9fec"
  },
  {
    "url": "assets/js/10.2304eb62.js",
    "revision": "4c6bf0b447c5a6c998cca9b32f94185f"
  },
  {
    "url": "assets/js/14.8528dfbb.js",
    "revision": "b816bb658db7ee59d2cf49c64da61dc7"
  },
  {
    "url": "assets/js/15.ec8b899a.js",
    "revision": "7327b5c9ac3c473bb4c5a23ff5579757"
  },
  {
    "url": "assets/js/16.27855832.js",
    "revision": "40aa202db4ffdbfebd14dec1167e15a8"
  },
  {
    "url": "assets/js/17.3fce90c2.js",
    "revision": "89502fe5b6830e05966ea3a7a649d608"
  },
  {
    "url": "assets/js/18.f891164e.js",
    "revision": "da1c2b9177ca76136e54c4fbf10743dc"
  },
  {
    "url": "assets/js/19.11b3293b.js",
    "revision": "5fa5380778c42a11b40ef76372faed63"
  },
  {
    "url": "assets/js/2.37b4f2de.js",
    "revision": "2ae195db2902f7fe81d459235553eed9"
  },
  {
    "url": "assets/js/20.8218d63b.js",
    "revision": "051f09d6931024a89e37180843c356a5"
  },
  {
    "url": "assets/js/21.1e831df4.js",
    "revision": "8703b870f7832b5c1455b4f4ccdbc23d"
  },
  {
    "url": "assets/js/22.67b07af6.js",
    "revision": "76d7852c1e2c14fe93f93c462f5330ba"
  },
  {
    "url": "assets/js/23.8d49f5b1.js",
    "revision": "e38d67a87d5ef7b251dd18333780c406"
  },
  {
    "url": "assets/js/24.20b3965c.js",
    "revision": "aaccb17e24363fc1bd423e098e936950"
  },
  {
    "url": "assets/js/25.c193eff0.js",
    "revision": "a5acd8de5ce97de33a10473b471b9e8d"
  },
  {
    "url": "assets/js/26.8d19a13e.js",
    "revision": "75a2ed22485c5e56d9d94cb513b52f26"
  },
  {
    "url": "assets/js/27.5ede67af.js",
    "revision": "9fd019d1f7846756948e1a5089321057"
  },
  {
    "url": "assets/js/28.471b2f18.js",
    "revision": "fe757a6eec5497f15af3eaccaea31638"
  },
  {
    "url": "assets/js/29.525b5464.js",
    "revision": "ab3fbbefc9ce2b35c3d4bd026d8b6789"
  },
  {
    "url": "assets/js/3.ba264b30.js",
    "revision": "7eab82dfdf6ff41b4f66934d11a2b860"
  },
  {
    "url": "assets/js/30.87bda591.js",
    "revision": "f1c00f072317c4ed81bbb4bce0e9652b"
  },
  {
    "url": "assets/js/31.de54b261.js",
    "revision": "987366e0f71c229e80b10088ed5b48d5"
  },
  {
    "url": "assets/js/32.003df6db.js",
    "revision": "3a04d0aea336883521fdf6c5c848117a"
  },
  {
    "url": "assets/js/33.03c0cf5e.js",
    "revision": "f59e2c8c92595396c86d40f36e04a0e7"
  },
  {
    "url": "assets/js/34.7d049e43.js",
    "revision": "ecf91d4713940948b0c7d12d79698bcf"
  },
  {
    "url": "assets/js/35.372f6e9a.js",
    "revision": "639cce231296dfa8f5e5ab25cbb1e3bc"
  },
  {
    "url": "assets/js/36.e09ea831.js",
    "revision": "7383b41ff572f04c4d795bccd8282509"
  },
  {
    "url": "assets/js/37.27e40b2f.js",
    "revision": "9d4621ceeeec7fadfe1d6cbf6ed56597"
  },
  {
    "url": "assets/js/38.9503c33d.js",
    "revision": "8b93afea050618546c5ed1a41ef22d3b"
  },
  {
    "url": "assets/js/39.24735fca.js",
    "revision": "490878c9f19c4f5dc75d0a8ab4f66501"
  },
  {
    "url": "assets/js/4.7a2bbb90.js",
    "revision": "fc28b0d968898abc7972fa804925ebdc"
  },
  {
    "url": "assets/js/40.98f2911b.js",
    "revision": "87b013ea15bf2e9472885b443f62dd1d"
  },
  {
    "url": "assets/js/41.d62b2e18.js",
    "revision": "d567127e865fb21c1864cb6106922f83"
  },
  {
    "url": "assets/js/42.4e7d2e73.js",
    "revision": "06035d79fbffd6b6a14d61bd7d55cd0f"
  },
  {
    "url": "assets/js/43.0fd21fce.js",
    "revision": "ae5bf1b74bdd2f4e8cf19442e7348c31"
  },
  {
    "url": "assets/js/44.e92e389b.js",
    "revision": "82fac6e03d37fceb8b1fdb53ad746db2"
  },
  {
    "url": "assets/js/45.50c7b12e.js",
    "revision": "6a0ef5126c92cf651991746732ede1f5"
  },
  {
    "url": "assets/js/5.2607fdc5.js",
    "revision": "ddf8179190aebe11432778595608ca74"
  },
  {
    "url": "assets/js/6.06be6eed.js",
    "revision": "d48f3d3d0e59b5aca644bd48f1dd9f79"
  },
  {
    "url": "assets/js/7.76df77c9.js",
    "revision": "16662242428f50e1b300eb9ad47daf7d"
  },
  {
    "url": "assets/js/8.a0777ab5.js",
    "revision": "aa2e7fb498ee04b59394a817c3a9f1ad"
  },
  {
    "url": "assets/js/9.e4ae1510.js",
    "revision": "dab234efd002833441d3d11aaba00926"
  },
  {
    "url": "assets/js/app.9ab284c3.js",
    "revision": "07843afe44845da4c44307af03d81d0d"
  },
  {
    "url": "assets/js/baidu.js",
    "revision": "d87b8800faffea165e2a687cbc58c31f"
  },
  {
    "url": "assets/js/vendors~docsearch.bcdf9d6e.js",
    "revision": "fa2438e8af7a7b597c974fe5f3f85372"
  },
  {
    "url": "assets/js/vendors~flowchart.5890e94e.js",
    "revision": "27d2df36e4f88f0adb5f77edce7c61d1"
  },
  {
    "url": "avatar.png",
    "revision": "9e9bc9348ad2729ea7d2aedf5dd2de88"
  },
  {
    "url": "categories/index.html",
    "revision": "19b3cde2c95920e352909d945cb4fddb"
  },
  {
    "url": "categories/java/index.html",
    "revision": "e3f29f09a156abaa2debb7f51cc7d687"
  },
  {
    "url": "categories/Java基础/index.html",
    "revision": "e505558150131a35f0bd80a71feea347"
  },
  {
    "url": "categories/前端/index.html",
    "revision": "1e47cbe73fac14981ed974f906433c81"
  },
  {
    "url": "categories/生活/index.html",
    "revision": "ac8f97955ef9f7b1c8dadf97e85fc692"
  },
  {
    "url": "css/style.css",
    "revision": "0b6bb50460c10cea419bf707274c4cda"
  },
  {
    "url": "guide/index.html",
    "revision": "7179615249f5a203a58564a1dc6e3b61"
  },
  {
    "url": "hero_white.png",
    "revision": "5c707c6a6f8be5e1b6d767c83cedc8d5"
  },
  {
    "url": "img/5.jpg",
    "revision": "c48683b7627396b02eb4a7df386431f5"
  },
  {
    "url": "img/kbjw2.jpg",
    "revision": "78b0701cb66d42de9a6eaa6b0ff38ece"
  },
  {
    "url": "img/logo.png",
    "revision": "b35e54e85218c085de994fdcdd7726bf"
  },
  {
    "url": "img/sidebar_280140.png",
    "revision": "30e2bf90705fc32e783f29a833736c17"
  },
  {
    "url": "img/sidebar_2801401.png",
    "revision": "0c2331a84c22028e9d50010be4c9b71f"
  },
  {
    "url": "img/sidebar_28014022.png",
    "revision": "67ed912a57fe22a89c7ef25bfa3d6c74"
  },
  {
    "url": "index.html",
    "revision": "e4ff9bdef8ee55866140e4a62d2e156a"
  },
  {
    "url": "js/custom.js",
    "revision": "437cc118e8b3a7a5a38efe104ad892b2"
  },
  {
    "url": "tag/index.html",
    "revision": "cda7cb34a64b86801a4709627b6abc81"
  },
  {
    "url": "tags/JavaSE/index.html",
    "revision": "f7bbacdcbb719762706026d9e595e55c"
  },
  {
    "url": "tags/Java基础/index.html",
    "revision": "bf0a3123d18d0076f7c1538e2a32e236"
  },
  {
    "url": "tags/js/index.html",
    "revision": "1ef11f3719f0c841644439238622116d"
  },
  {
    "url": "tags/Spring/index.html",
    "revision": "470f552640b8cc987bc85337bb8f780f"
  },
  {
    "url": "tags/SpringBoot/index.html",
    "revision": "912879335904465d3ce4846a464517a8"
  },
  {
    "url": "tags/vue/index.html",
    "revision": "ee0542830a0b23b0a083fe1b7b706157"
  },
  {
    "url": "tags/分享生活/index.html",
    "revision": "bd861778510f7c92e20a0d7206ec92fd"
  },
  {
    "url": "tags/生活/index.html",
    "revision": "627af0306fb0b169736a504b09ad325e"
  },
  {
    "url": "tags/零基础/index.html",
    "revision": "4925509b077601c9d4f67fd595ac3041"
  },
  {
    "url": "tags/面向对象/index.html",
    "revision": "c72311466a998d2fb706bd2df82f39da"
  },
  {
    "url": "timeline/index.html",
    "revision": "0356aabdb5e7abee27ad5d1b9b5ec8e8"
  },
  {
    "url": "view.png",
    "revision": "81e8422c4d92eb2d5dd6ddae272bcef0"
  },
  {
    "url": "技术文章/index.html",
    "revision": "3ebd8533c886fbe84294468be6d4578e"
  },
  {
    "url": "技术文章/java/javase.html",
    "revision": "663c1148e313bcdf361c1f1331d4c3ab"
  },
  {
    "url": "技术文章/java高级/javaee.html",
    "revision": "9900463c497e8e06f2b3262e505d5dbb"
  },
  {
    "url": "技术文章/vue/vue01.html",
    "revision": "522e786f151c7878f28e32047e5b64c4"
  },
  {
    "url": "生活分享/life.html",
    "revision": "7338161c9f2c9740216fe86c37f6e969"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
