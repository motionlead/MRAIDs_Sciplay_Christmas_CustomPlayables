import { Video } from "./Video";
import { logError } from "../../helper";
import { addControlsVideo } from "./controls";

export const launchVideo = (sc, width, height) => {
  const onEnded = () => logError("video Ended");
  const onError = () => logError("video Error");

  const videoParameters = {
    src: "https://dsp-creatives.s3.amazonaws.com/mraid_videos/MyGames_LeftToSurvive_Multiplecampaigns_v1_May22.mp4",
    regX: 0.5,
    regY: 0.5,
    onEnded,
    onError,
    // playbackRate: 5,
    splashScreen: "splashScreen",
  };

  const component = new Video(videoParameters);
  component.x = width / 2;
  component.y = height / 2;
  component.play();
  // component.stop();
  sc.addChild(component);

  createjs.Tween.get(component, { loop: true })
    .to({ scaleX: 0.8, scaleY: 0.8 }, 2500, createjs.Ease.quadOut)
    .to({ scaleX: 1, scaleY: 1 }, 2500, createjs.Ease.quadOut);

  // controls
  addControlsVideo(component);

  return component;
};
