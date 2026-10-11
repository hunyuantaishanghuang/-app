export interface HealthRecord {
  id: string;
  name: string;
  gender: '男' | '女' | string;
  age: number;
  phone?: string;
  idCard?: string;
  chronicDiseases?: string; // 慢病史/既往史，如"高血压"、"糖尿病"、"高血压、糖尿病"
  isHypertension?: boolean;
  isDiabetes?: boolean;
  symptoms?: string; // 现存症状：如"胸痛"、"胸闷"、"心悸"、"头晕"、"无症状"等

  // ① 血压
  sbp?: number; // 收缩压 mmHg
  dbp?: number; // 舒张压 mmHg

  // ② 血糖
  fbg?: number; // 血糖 mmol/L

  // ③ 肝功能
  tbil?: number; // 总胆红素 μmol/L
  alt?: number;  // 谷丙转氨酶 U/L
  ast?: number;  // 谷草转氨酶 U/L

  // ④ 血脂
  tg?: number;   // 甘油三酯 mmol/L
  tc?: number;   // 总胆固醇 mmol/L
  ldl?: number;  // 低密度脂蛋白 mmol/L

  // ⑤ 心电图
  ecgResult?: string; // 心电图结论描述

  // ⑥ 肾功能
  cr?: number;   // 肌酐 μmol/L
  bun?: number;  // 尿素氮 mmol/L

  // ⑦ 血常规
  hgb?: number;  // 血红蛋白 g/L
  wbc?: number;  // 白细胞 10^9/L
  plt?: number;  // 血小板 10^9/L

  // ⑧ 尿常规
  urineProtein?: string;   // 尿蛋白 (如 1+, 2+, 阴性, -)
  urineRBC?: string;       // 尿红细胞 (如 1+, 2+, -)
  urineOccultBlood?: string; // 尿潜血 (如 1+, 2+, -)
  urineKetone?: string;    // 尿酮体 (如 1+, 2+, -)

  // ⑨ 腹部B超
  ultrasoundResult?: string; // 腹部B超描述及结论

  // ⑩ 胸部DR
  chestDrResult?: string;    // 胸部DR结论

  // ⑪ 尿酸
  uricAcid?: number; // 尿酸 μmol/L

  // 原始行数据（保留导入的所有列）
  rawRow?: Record<string, any>;
}

export interface RuleHit {
  ruleId: number; // 1 to 11
  ruleName: string;
  shortLabel: string;
  details: string[]; // 触发该规则的具体指标和值
  level: 'critical' | 'high' | 'moderate'; // 严重等级
}

export interface ScreeningResult {
  record: HealthRecord;
  hasPositive: boolean;
  ruleHits: RuleHit[];
  criticalCount: number;
  totalHitsCount: number;
}

export interface RuleThresholds {
  sbpMax: number; // 180
  dbpMax: number; // 110
  fbgMin: number; // 3.9
  fbgMax: number; // 16.7
  tbilMax: number; // 34.2
  altMax: number; // 80
  astMax: number; // 80
  // 血脂 - 普通人群
  generalTgMax: number; // 5.6
  generalTcMax: number; // 7.2
  generalLdlMax: number; // 4.9
  // 血脂 - 高血压患者
  hypTgMax: number; // 5.2
  hypLdlMax: number; // 3.4
  // 血脂 - 高血压糖尿病双患患者
  dualLdlMax: number; // 1.8
  // 肾功能
  crMax: number; // 124
  bunMax: number; // 9.0
  // 血常规
  hgbMin: number; // 90
  wbcMin: number; // 4.0
  wbcMax: number; // 10.0
  pltMin: number; // 50
  pltMax: number; // 300
  // 尿酸
  uaMax: number; // 420
}

export interface ColumnMapping {
  name: string;
  gender: string;
  age: string;
  phone: string;
  idCard: string;
  chronicDiseases: string;
  symptoms: string;
  sbp: string;
  dbp: string;
  bpCombined?: string; // 类似 "140/90" 的血压合一列
  fbg: string;
  tbil: string;
  alt: string;
  ast: string;
  tg: string;
  tc: string;
  ldl: string;
  ecgResult: string;
  cr: string;
  bun: string;
  hgb: string;
  wbc: string;
  plt: string;
  urineProtein: string;
  urineRBC: string;
  urineOccultBlood: string;
  urineKetone: string;
  ultrasoundResult: string;
  chestDrResult: string;
  uricAcid: string;
}
