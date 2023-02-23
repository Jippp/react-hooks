import SparkMD5 from "spark-md5";

import { CHUNKSIZE } from '../config'

/**
 * 通过spark-md5获取文件hash
 * @param {(File | Blob)[]} fileList 文件数组
 * @returns {Promise<string>} 计算hash的promise
 */
export const getFileHash = (fileList: (File | Blob)[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer();
    const fileLen = fileList.length;

    function hashNext(count: number) {
      const reader = new FileReader();
      reader.readAsArrayBuffer(fileList[count]);
      reader.onload = (e: ProgressEvent<FileReader>) => {
        count++;
        spark.append((e.target as FileReader).result as ArrayBuffer);
        if (count === fileLen) {
          resolve(spark.end())
        } else {
          hashNext(count);
        }
      };
      reader.onerror = () => {
        reject('hash error!')
      }
    }
    hashNext(0);

  }) as Promise<string>
}

/**
 * 分割文件
 * @param {File} file 文件
 * @returns {Object} chunkCount--分片数量, chunkList--文件分片
 */
export const sliceFile = (file: File): {
  chunkCount: number, chunkList: Blob[]
} => {
  let chunkIndex = 0
  const chunkList: Blob[] = []

  function spliceFile() {
    chunkList.push(file.slice(chunkIndex * CHUNKSIZE, (chunkIndex + 1) * CHUNKSIZE))
    if(++chunkIndex * CHUNKSIZE < file.size) {
      spliceFile()
    }
  }
  spliceFile()
  return {
    chunkCount: chunkIndex, chunkList
  }
}