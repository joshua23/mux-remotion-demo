import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { formatNumber, getCurrentValue } from '../utils';
import data from "../data/views_by_device.json";
import Layout from "../components/Layout";
import Measure from "../components/Measure";
import Trend from "../components/Trend";

import Tablet from '../components/icons/Tablet';
import Desktop from '../components/icons/Desktop';
import Tv from '../components/icons/Tv';
import Phone from '../components/icons/Mobile';

const DEVICE_LOOKUP: Record<string, React.ComponentType> = {
  phone: Phone,
  tv: Tv,
  desktop: Desktop,
  tablet: Tablet
}

const DEVICE_NAME_CN: Record<string, string> = {
  phone: "手机",
  tv: "电视",
  desktop: "桌面电脑",
  tablet: "平板电脑"
}

const Stat = ({ index, children }: { readonly index: number; readonly children: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scale the index value up by a factor of 8
  const scale = index * 8;

  const offset = spring({
    frame: frame - 10 - scale, // delay the starting frame of the animation
    from: -100,
    to: 0,
    fps,
    config: {
      damping: 60,
      mass: 0.4
    }
  });

  const opacity = interpolate(frame, [10 + scale, 20 + scale], [0, 1]);

  return (
    <div className="flex items-center border-t-2 border-mux-green-darker py-6 px-4 relative" style={{ transform: `translateY(${offset}px)`, opacity }}>{children}</div>
  )
}

const Value = ({ children }: { readonly children: React.ReactNode }) => (
  <div className="z-10 font-sans tracking-tight text-3xl leading-none" style={{ width: "700px" }}>{children}</div>
)

const Label = ({ children }: { readonly children: React.ReactNode }) => (
  <div className="text-mux-black text-lg font-sans capitalize z-10 tracking-tight" style={{ width: "250px" }}>{children}</div>
)

export const Devices: React.FC = () => {
  const leadingDeviceViews = data[0].data.sort((a, b) => b.views - a.views)[0].views;

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const driver = spring({
    frame,
    fps,
    config: {
      damping: 60,
      overshootClamping: true
    }
  });

  return (
    <Layout bodyClass="bg-mux-green" title="按设备分类的观看数据" timeframe={data[0].timeframe} >
      <div className="grid grid-rows-5">
        {data[0].data.map((device, i) => {
          const Icon = DEVICE_LOOKUP[device.field];
          const totalViews = getCurrentValue(driver, device.views);
          const previousMonthViews = data[1].data.find(d => d.field === device.field)?.views || 0

          return (
            <Stat key={device.value} index={i}>
              <div className="z-10 w-28 pl-6 mr-20">
                <Icon />
              </div>
              <Measure index={i} value={(device.views / leadingDeviceViews) * 100} />
              <Value>{formatNumber(totalViews)}</Value>
              <Label>{DEVICE_NAME_CN[device.field]}</Label>
              <div className="flex justify-end -mt-4" style={{ width: "550px" }}>
                <Trend border color="green" pastMonthValue={device.views} previousMonthValue={previousMonthViews} />
              </div>
            </Stat>
          )
        })}
      </div>
    </Layout>
  );
};
