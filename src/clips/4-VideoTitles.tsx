import React from 'react';
import Layout from "../components/Layout";
import Measure from "../components/Measure";
import { formatNumber } from '../utils';

import data from "../data/views_by_title.json";

const Stat = ({ children }: { readonly children: React.ReactNode }) => (
  <div className="flex border-t-2 border-mux-purple pt-5 px-4 relative h-36 tracking-tight" style={{ fontSize: "46px", lineHeight: "54px" }}>{children}</div>
)

const Value = ({ children }: { readonly children: React.ReactNode }) => (
  <div className="font-normal z-10">{children}</div>
)

const Label = ({ children }: { readonly children: React.ReactNode }) => (
  <div className="text-mux-black flex-1 z-10 mr-10">{children}</div>
)

const Index = ({ children }: { readonly children: React.ReactNode }) => (
  <div className="text-mux-purple mr-8 z-10 w-10">{children}.</div>
)

export const VideoTitles: React.FC = () => {
  const maxDatasetViews = data[0].data.sort((a, b) => b.views - a.views)[0].views;

  return (
    <Layout bodyClass="bg-mux-lavendar" title="观看次数最多的前10个视频" timeframe={data[0].timeframe} >
      <div className="grid grid-cols-2 gap-x-10">
        <div>
          {data[0].data.slice(0, 5).map((videoItem, i) => (
            <Stat key={videoItem.field}>
              <Measure index={i} value={(videoItem.views / maxDatasetViews) * 100} />
              <Index>{i + 1}</Index>
              <Label>{videoItem.field}</Label>
              <Value>{formatNumber(videoItem.views)}</Value>
            </Stat>
          ))}
        </div>
        <div>
          {data[0].data.slice(5, 10).map((videoItem, i) => (
            <Stat key={videoItem.field}>
              <Measure index={i + 5} value={(videoItem.views / maxDatasetViews) * 100} />
              <Index>{i + 6}</Index>
              <Label>{videoItem.field}</Label>
              <Value>{formatNumber(videoItem.views)}</Value>
            </Stat>
          ))}
        </div>
      </div>
    </Layout>
  );
};
