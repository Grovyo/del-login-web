import React from 'react'
import Lottie from 'lottie-react'
import animation from "./assets/loading.json"

const Lotties = () => {
  return (
    <div>
      <Lottie animationData={animation}
      loop={true}
      autoplay={true}
      size={200}
      ></Lottie>
    </div>
  )
}

export default Lotties
