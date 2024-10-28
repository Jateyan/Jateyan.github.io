



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

// 启动
function start(){
// 检查无障碍服务是否已经启用，如果没有启用则跳转到无障碍服务启用界面，并等待无障碍服务启动；当无障碍服务启动后脚本会继续运行
  auto.waitFor()
  console.show()
  
  log("开始运行脚本==============")
  launchApp('');
  watchVideo(20000)

}

start()