import {
  Cartesian3,
  CesiumTerrainProvider,
  IonResource,
  Viewer,
  Math as CMath,
} from 'cesium';
import React, { useEffect, useRef, useState } from 'react';

import { initMap } from '@/utils/initMap';
import {
  AreaMeasure,
  AreaSurfaceMeasure,
  DistanceMeasure,
  DistanceSurfaceMeasure,
  Measure,
} from 'cesium-extends';
import './index.less';

interface MapProps {}

const measureOptions: {
  label: string;
  key: string;
  tool: typeof Measure;
}[] = [
  {
    label: 'Distance',
    key: 'Distance',
    tool: DistanceMeasure,
  },
  {
    label: 'SurfaceDistance',
    key: 'SurfaceDistance',
    tool: DistanceSurfaceMeasure,
  },
  {
    label: 'Area',
    key: 'Area',
    tool: AreaMeasure,
  },
  {
    label: 'SurfaceArea',
    key: 'SurfaceArea',
    tool: AreaSurfaceMeasure,
  },
];

const Map: React.FC<MapProps> = () => {
  const viewer = useRef<Viewer>();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const measure = useRef<Measure>();

  const onChangeTool = (
    name: string | null,
    Tool: typeof Measure | null = null,
  ) => {
    if (!viewer.current) return;

    if (measure.current) {
      measure.current.destroy();
      measure.current = undefined;
    }
    const newToolName = activeTool === name ? null : name;
    setActiveTool(newToolName);

    if (newToolName && Tool) {
      measure.current = new Tool(viewer.current, {
        units: 'kilometers',
        locale: {
          start: 'start',
          area: 'area',
          total: 'total',
          formatLength: (length, unitedLength) => {
            if (length < 1000) {
              return length + 'm';
            }
            return unitedLength + 'km';
          },
          formatArea: (area, unitedArea) => {
            if (area < 1000000) {
              return area + '平方米';
            }
            return unitedArea + '平方千米';
          },
        },
        drawerOptions: {
          tips: {
            init: '点击绘制',
            start: '左键添加点，右键移除点，双击结束绘制',
          },
        },
      });
      measure.current.start();
    }
  };

  useEffect(() => {
    viewer.current = initMap('cesiumContainer');
    // 创建 TerrainProvider 对象
    CesiumTerrainProvider.fromIonAssetId(1).then((terrainProvider) => {
      if (viewer.current) {
        // 将 TerrainProvider 对象添加到 Viewer 中
        viewer.current.terrainProvider = terrainProvider;

        viewer.current.camera.setView({
          destination: Cartesian3.fromDegrees(120, 28, 50000),
          orientation: {
            heading: CMath.toRadians(0),
            pitch: CMath.toRadians(-45),
            roll: CMath.toRadians(0),
          },
        });
      }
    });

    return () => {
      measure.current?.destroy();
      measure.current = undefined;
      viewer.current?.destroy();
    };
  }, []);

  const clear = () => {
    measure.current?.end();
  };

  return (
    <div id="cesiumContainer">
      <div className="draw-tools">
        {measureOptions.map((item) => (
          <button
            key={item.key}
            onClick={() => onChangeTool(item.key, item.tool)}
          >
            {item.label}
          </button>
        ))}
        <button onClick={clear}>Cancel</button>
      </div>
    </div>
  );
};

export default Map;
