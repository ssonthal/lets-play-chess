export default class EngineUtil {
    static getDepthByLevel(level: 1 | 2 | 3): number {
        switch (level) {
          case 1: return 4;
          case 2: return 8;
          case 3: return 16;
        }
    }
}