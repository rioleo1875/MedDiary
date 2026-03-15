module.exports = {

  // BLOOD SUGAR
  fbs: {
    aliases: ["fbs", "fasting blood sugar", "fasting glucose", "glucose", "blood sugar", "sugar"],
    normal_min: 70,
    normal_max: 100
  },

  rbs: {
    aliases: ["rbs", "random blood sugar", "random glucose"],
    normal_min: 70,
    normal_max: 140
  },

  hba1c: {
    aliases: ["hba1c", "a1c", "glycated hemoglobin"],
    normal_min: 4,
    normal_max: 5.6
  },

  // THYROID
  tsh: {
    aliases: ["tsh", "thyroid stimulating hormone", "tsh 3rd generation"],
    normal_min: 0.4,
    normal_max: 4.5
  },

  t3: {
    aliases: ["t3", "triiodothyronine"],
    normal_min: 80,
    normal_max: 200
  },

  t4: {
    aliases: ["t4", "thyroxine"],
    normal_min: 5,
    normal_max: 12
  },

  // CBC
  hemoglobin: {
    aliases: ["hb", "hemoglobin", "haemoglobin"],
    normal_min: 12,
    normal_max: 16
  },

  wbc: {
    aliases: ["wbc", "white blood cell count"],
    normal_min: 4000,
    normal_max: 11000
  },

  rbc: {
    aliases: ["rbc", "red blood cell count"],
    normal_min: 4.2,
    normal_max: 5.9
  },

  platelets: {
    aliases: ["platelets", "platelet count"],
    normal_min: 150000,
    normal_max: 450000
  },

  aec: {
    aliases: ["aec", "absolute eosinophil count"],
    normal_min: 0,
    normal_max: 500
  },

  abc: {
    aliases: ["abc", "absolute basophil count"],
    normal_min: 0,
    normal_max: 100
  },

  aalc: {
    aliases: ["aalc", "absolute atypical lymphocyte count"],
    normal_min: 0,
    normal_max: 400
  },

  // LIVER
  alt: {
    aliases: ["alt", "sgpt", "alanine aminotransferase"],
    normal_min: 7,
    normal_max: 56
  },

  ast: {
    aliases: ["ast", "sgot", "aspartate aminotransferase"],
    normal_min: 10,
    normal_max: 40
  },

  alp: {
    aliases: ["alp", "alkaline phosphatase"],
    normal_min: 44,
    normal_max: 147
  },

  albumin: {
    aliases: ["albumin", "serum albumin"],
    normal_min: 3.5,
    normal_max: 5
  },

  ag_ratio: {
    aliases: ["a/g ratio", "albumin globulin ratio"],
    normal_min: 1,
    normal_max: 2.5
  },

  // KIDNEY
  creatinine: {
    aliases: ["creatinine", "serum creatinine"],
    normal_min: 0.6,
    normal_max: 1.3
  },

  bun: {
    aliases: ["bun", "blood urea nitrogen"],
    normal_min: 7,
    normal_max: 20
  },

  uric_acid: {
    aliases: ["uric acid"],
    normal_min: 3.5,
    normal_max: 7.2
  },

  urea: {
    aliases: ["urea", "blood urea"],
    normal_min: 15,
    normal_max: 40
  },

  // ELECTROLYTES
  sodium: {
    aliases: ["sodium"],
    normal_min: 135,
    normal_max: 145
  },

  potassium: {
    aliases: ["potassium"],
    normal_min: 3.5,
    normal_max: 5
  },

  chloride: {
    aliases: ["chloride"],
    normal_min: 98,
    normal_max: 106
  },

  calcium: {
    aliases: ["calcium"],
    normal_min: 8.6,
    normal_max: 10.2
  },

  magnesium: {
    aliases: ["magnesium"],
    normal_min: 1.7,
    normal_max: 2.2
  },

  phosphorus: {
    aliases: ["phosphorus"],
    normal_min: 2.5,
    normal_max: 4.5
  },

  // LIPID PROFILE
  cholesterol: {
    aliases: ["cholesterol", "total cholesterol"],
    normal_min: 120,
    normal_max: 200
  },

  hdl: {
    aliases: ["hdl", "hdl cholesterol"],
    normal_min: 40,
    normal_max: 60
  },

  ldl: {
    aliases: ["ldl", "ldl cholesterol"],
    normal_min: 0,
    normal_max: 100
  },

  triglycerides: {
    aliases: ["triglycerides"],
    normal_min: 0,
    normal_max: 150
  },

  // HORMONES
  testosterone: {
    aliases: ["testosterone"],
    normal_min: 300,
    normal_max: 1000
  },

  progesterone: {
    aliases: ["progesterone", "17 oh progesterone"],
    normal_min: 0,
    normal_max: 20
  },

  acth: {
    aliases: ["acth", "adrenocorticotropic hormone"],
    normal_min: 7,
    normal_max: 63
  },

  adh: {
    aliases: ["adh", "antidiuretic hormone"],
    normal_min: 0,
    normal_max: 5
  },

  // URINE
  urine_protein: {
    aliases: ["urine protein"],
    normal_min: 0,
    normal_max: 150
  },

  urine_creatinine: {
    aliases: ["urine creatinine"],
    normal_min: 20,
    normal_max: 275
  },

  urine_albumin: {
    aliases: ["urine albumin", "microalbumin"],
    normal_min: 0,
    normal_max: 30
  },

  urine_sodium: {
    aliases: ["urine sodium"],
    normal_min: 40,
    normal_max: 220
  },

  urine_potassium: {
    aliases: ["urine potassium"],
    normal_min: 25,
    normal_max: 125
  }

};