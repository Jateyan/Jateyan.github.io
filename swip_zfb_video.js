
// const screen_width = 1080;  //设置屏幕的宽度，像素值
// const screen_height = 2340; //设置屏幕的高度，像素值

const perVideoWatchTime=5//每隔视频观看10秒
const halfDeviceHeight=device.height/2
const halfDeviceWidth=device.width/2
const videoSwipeDistance=halfDeviceHeight-100//视频下滑的长度 px

/**
 * 准备工作
 */
function prepare(){
  auto()
  console.show()
  log("准备工作")
  // app.setScreenMetrics(screen_width, screen_height);
  launchApp("支付宝");
  sleep(3000);
}

//swipeCount，滑动视频的次数
function swipeVideo(swipeCount){
  let offset=random(-100,0)
  if(swipeCount%6==0){
      //  双数的第6次下滑
      swipe(halfDeviceWidth-random(-50,50), halfDeviceHeight+offset+(videoSwipeDistance/2), 
      halfDeviceWidth+random(-50,50), halfDeviceHeight+offset-(videoSwipeDistance/2), 30);
  }else if(swipeCount%2==0){
      //双数次上滑        
      swipe(halfDeviceWidth+random(-50,50), halfDeviceHeight+offset, 
      halfDeviceWidth+random(-50,50), halfDeviceHeight+offset+(videoSwipeDistance/2), 30);
  
  }else {
      //单数下滑
      swipe(halfDeviceWidth-random(-50,50), halfDeviceHeight+offset+(videoSwipeDistance/2), 
      halfDeviceWidth+random(-50,50), halfDeviceHeight+offset-(videoSwipeDistance/2), 30);
  }

}
/**
 * 看视频
 * @param {*} totalTime 
 */
function watchVideo(totalTime){
  log("计划时长："+totalTime)
  let watchTime=0;
  for(let i=1;totalTime>watchTime;i++){
      let waitTime=perVideoWatchTime+random(-4,4)
      log("本视频观看时长"+waitTime)
      sleep(waitTime/2*1000);
      sleep(waitTime/2*1000);
      watchTime+=waitTime
      log("已看："+i+"个视频 "+watchTime+"秒")
      swipeVideo(i)

  }
}

/**
 * 打开刷视频界面
 */
function openVideoPage(){
  log("尝试打开视频界面")
  sleep(300)
  // clickByTextDesc("蚂蚁庄园",0);
  const flag = click('视频')
  log("视频界面打开成功！",flag)
  sleep(300)
  const totalTime=2*60*60 //刷2小时
  watchVideo(totalTime)
}
// 主函数
function main(){
  // 准备工作
  prepare()
  // 打开视频页面
  openVideoPage()
}

main()