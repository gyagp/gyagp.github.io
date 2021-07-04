const numberInfo = {
  "01": ["樊星慧", "fxh", 0], 
  "02": ["顾诗云", "gsy", 0],
  "03": ["何云轩", "xh", 0], 
  "04": ["贺钦", "hq", 270],
  "05": ["胡馨予", "xh", 0],
  "06": ["黄泽琳", "hzl", 0],
  "07": ["李珈亿", "ljy", 0],
  "08": ["罗羽菲", "lyf", 0],
  "09": ["沈逸书", "sys", 0],
  "10": ["施语菡", "syh", 0],
  "11": ["汪金霖", "wjl", 0],
  "12": ["王敦敏", "wdm", 0],
  "13": ["魏子涵", "wzh", 0],
  "14": ["吴昕阳", "xh", 0],
  "15": ["奚祺玥", "xqy", 0],
  "16": ["严悦尔", "yye", 0],
  "17": ["杨淼", "ym", 90],
  "18": ["杨沈伟朵", "yswd", 0],
  "19": ["姚静溢", "yjy", 0],
  "20": ["余羽桐", "yyt", 0],
  "21": ["曹溢", "cy", 0],
  "22": ["陈丙坤", "xh", 0],
  "23": ["陈瀚森", "chs", 0],
  "24": ["陈子涵", "czh", 0],
  "25": ["葛君豪", "xh", 0],
  "26": ["葛霄尧", "xh", 0],
  "27": ["胡隽逸", "hjy", 0],
  "28": ["黄德洋", "hdy", 90],
  "29": ["姜岳", "jy", 0],
  "30": ["梁泽楷", "xh", 0],
  "31": ["刘奕晟", "lys", 0],
  "32": ["钱余哲", "qyz", 90],
  "33": ["童昭源", "tzy", 0],
  "34": ["王腾熙", "wtx", 0],
  "35": ["王泽骏", "wzj", 90],
  "36": ["王梓轩", "wzx", 0],
  "37": ["肖毅", "xy", 90],
  "38": ["徐兴羽", "xxy", 0],
  "39": ["张旼卓", "zmz", 0],
  "40": ["张玉灏", "zyh", 0],
  "41": ["周宏宇", "zhy", 0],
  "42": ["周鸿畅", "zhc", 0],
};
const NUMBERINFO_INDEX_NAME = 0;
const NUMBERINFO_INDEX_PINYIN = 1;
const NUMBERINFO_INDEX_ROTATE = 2;
var numbers = Object.keys(numberInfo).sort();
var numbersLength = numbers.length;

String.prototype.format= function() {
  var args = Array.prototype.slice.call(arguments);
  var count = 0;
  return this.replace(/%s/g, function(s,i){
    return args[count++];
  });
}