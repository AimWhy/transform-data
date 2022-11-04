/*!
 * transform-data - v0.1.0
 * @aimwhy/transform-data is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * @copyright (C) 2011 - 2022 aimWhy
 */
const Value = (v) => () => v;
const Origin = Symbol.for("origin");
const Retain = Symbol.for("retain");
const Remove = Symbol.for("remove");

const ReferBase = Symbol.for("referBase");

function recordData(data, recordMap = {}, path = "") {
  recordMap[path] = data;
  if (!data) {
    return recordMap;
  }
  if (Array.isArray(data) || typeof data === "object") {
    const keys = Object.keys(data);
    for (const k of keys) {
      const subPath = path ? path + "." + k : k;
      recordData(data[k], recordMap, subPath);
    }
  }
  return recordMap;
}

function genPatternData(pattern, recordMap, path = "", referBase = "") {
  if (typeof pattern === "string") {
    let rKey = pattern;
    if (rKey.startsWith("$")) {
      rKey = rKey.slice(1);
    } else if (referBase) {
      rKey = referBase + "." + rKey;
    }
    return recordMap[rKey];
  }
  if (typeof pattern === "function") {
    return pattern(recordMap, path, referBase);
  }
  const isArray = Array.isArray(pattern);
  if (isArray || typeof pattern === "object") {
    let result = isArray ? [] : {};

    if (isArray) {
      if (pattern[1] === Origin) {
        const referPath = pattern[2];
        const originArr = recordMap[referPath];
        const reference = pattern[0];
        // 填充数组的匹配模式
        pattern = Array(originArr.length)
          .fill(1)
          .map(() => (reference && typeof reference === "object" ? { ...reference } : reference));
        pattern[ReferBase] = referPath;
      }
    } else if (Origin in pattern) {
      const referPath = pattern[Origin];
      const originObj = recordMap[referPath];
      result = JSON.parse(JSON.stringify(originObj));

      if (Remove in pattern) {
        const removeKeys = pattern[Remove];
        removeKeys.forEach((removeKey) => {
          delete result[removeKey];
        });
      }
      if (Retain in pattern) {
        const retainKeySet = new Set(pattern[Retain]);
        const allKeys = Object.keys(result);
        allKeys.forEach((removeKey) => {
          if (retainKeySet.has(removeKey)) {
            delete result[removeKey];
          }
        });
      }
      pattern[ReferBase] = referPath;
    }

    const keys = Object.keys(pattern);
    for (const k of keys) {
      const subPath = path ? path + "." + k : k;
      let tempReferBase = pattern[ReferBase] || referBase;
      if (isArray && tempReferBase) {
        tempReferBase += "." + k;
      }
      result[k] = genPatternData(pattern[k], recordMap, subPath, tempReferBase);
    }
    return result;
  }
  return pattern;
}

function dataTransform(data, pattern) {
  const recordMap = recordData(data);
  return genPatternData(pattern, recordMap);
}

export { Origin, Remove, Retain, Value, dataTransform };
