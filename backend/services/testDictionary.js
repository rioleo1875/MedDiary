module.exports = {

  // BLOOD SUGAR
  fbs: {
    aliases: ["fbs", "fasting blood sugar", "fasting glucose", "glucose", "blood sugar", "sugar", "glucose, fasting(f)", "fasting"],
    normal_min: 70,
    normal_max: 100,
    unit: "mg/dL"
  },

  rbs: {
    aliases: ["rbs", "random blood sugar", "random glucose"],
    normal_min: 70,
    normal_max: 140,
    unit: "mg/dL"
  },

  hba1c: {
    aliases: ["hba1c", "a1c", "glycated hemoglobin"],
    normal_min: 4,
    normal_max: 5.6,
    unit: "%"
  },

  // THYROID
  tsh: {
    aliases: ["tsh", "thyroid stimulating hormone", "tsh 3rd generation"],
    normal_min: 0.4,
    normal_max: 4.5,
    unit: "µIU/mL"
  },

  t3: {
    aliases: ["t3", "triiodothyronine"],
    normal_min: 80,
    normal_max: 200,
    unit: "ng/dL"
  },

  t4: {
    aliases: ["t4", "thyroxine"],
    normal_min: 5,
    normal_max: 12,
    unit: "µg/dL"
  },

  // CBC
  hemoglobin: {
    aliases: ["hb", "hemoglobin", "haemoglobin"],
    normal_min: 12,
    normal_max: 16,
    unit: "g/dL"
  },

  wbc: {
    aliases: ["wbc", "white blood cell count"],
    normal_min: 4000,
    normal_max: 11000,
    unit: "cells/µL"
  },

  rbc: {
    aliases: ["rbc", "red blood cell count"],
    normal_min: 4.2,
    normal_max: 5.9,
    unit: "million/µL"
  },

  platelets: {
    aliases: ["platelets", "platelet count"],
    normal_min: 150000,
    normal_max: 450000,
    unit: "cells/µL"
  },

  aec: {
    aliases: ["aec", "absolute eosinophil count"],
    normal_min: 0,
    normal_max: 500,
    unit: "cells/µL"
  },

  abc: {
    aliases: ["abc", "absolute basophil count"],
    normal_min: 0,
    normal_max: 100,
    unit: "cells/µL"
  },

  aalc: {
    aliases: ["aalc", "absolute atypical lymphocyte count"],
    normal_min: 0,
    normal_max: 400,
    unit: "cells/µL"
  },
  
  //IMMUNOLOGY | ALLERGY
  ige: {
    aliases: [
      "ige",
      "immunoglobulin e",
      "total ige",
      "serum ige",
      "ige total"
    ],
    normal_min: 0,
    normal_max: 100,
    unit: "IU/mL"
  },

  igg: {
    aliases: [
      "igg",
      "immunoglobulin g"
    ],
    normal_min: 700,
    normal_max: 1600,
    unit: "mg/dL"
  },

  iga: {
    aliases: [
      "iga",
      "immunoglobulin a"
    ],
    normal_min: 70,
    normal_max: 400,
    unit: "mg/dL"
  },

  igm: {
    aliases: [
      "igm",
      "immunoglobulin m"
    ],
    normal_min: 40,
    normal_max: 230,
    unit: "mg/dL"
  },

  crp: {
    aliases: [
      "crp",
      "c reactive protein",
      "c-reactive protein"
    ],
    normal_min: 0,
    normal_max: 5,
    unit: "mg/L"
  },

  esr: {
    aliases: [
      "esr",
      "erythrocyte sedimentation rate"
    ],
    normal_min: 0,
    normal_max: 20,
    unit: "mm/hr"
  },

  ana: {
    aliases: [
      "ana",
      "antinuclear antibody"
    ],
    normal_min: 0,
    normal_max: 1,
    unit: "titer"
  },

  rf: {
    aliases: [
      "rf",
      "rheumatoid factor"
    ],
    normal_min: 0,
    normal_max: 20,
    unit: "IU/mL"
  },

  // LIVER
  alt: {
    aliases: ["alt", "sgpt", "alanine aminotransferase"],
    normal_min: 7,
    normal_max: 56,
    unit: "U/L"
  },

  ast: {
    aliases: ["ast", "sgot", "aspartate aminotransferase"],
    normal_min: 10,
    normal_max: 40,
    unit: "U/L"
  },

  alp: {
    aliases: ["alp", "alkaline phosphatase"],
    normal_min: 44,
    normal_max: 147,
    unit: "U/L"
  },

  albumin: {
    aliases: ["albumin", "serum albumin"],
    normal_min: 3.5,
    normal_max: 5,
    unit: "g/dL"
  },

  ag_ratio: {
    aliases: ["a/g ratio", "albumin globulin ratio"],
    normal_min: 1,
    normal_max: 2.5,
    unit: "ratio"
  },

  // KIDNEY
  creatinine: {
    aliases: ["creatinine", "serum creatinine"],
    normal_min: 0.6,
    normal_max: 1.3,
    unit: "mg/dL"
  },

  bun: {
    aliases: ["bun", "blood urea nitrogen"],
    normal_min: 7,
    normal_max: 20,
    unit: "mg/dL"
  },

  uric_acid: {
    aliases: ["uric acid"],
    normal_min: 3.5,
    normal_max: 7.2,
    unit: "mg/dL"
  },

  urea: {
    aliases: ["urea", "blood urea"],
    normal_min: 15,
    normal_max: 40,
    unit: "mg/dL"
  },

  // ELECTROLYTES
  sodium: {
    aliases: ["sodium"],
    normal_min: 135,
    normal_max: 145,
    unit: "mmol/L"
  },

  potassium: {
    aliases: ["potassium"],
    normal_min: 3.5,
    normal_max: 5,
    unit: "mmol/L"
  },

  chloride: {
    aliases: ["chloride"],
    normal_min: 98,
    normal_max: 106,
    unit: "mmol/L"
  },

  calcium: {
    aliases: ["calcium"],
    normal_min: 8.6,
    normal_max: 10.2,
    unit: "mg/dL"
  },

  magnesium: {
    aliases: ["magnesium"],
    normal_min: 1.7,
    normal_max: 2.2,
    unit: "mg/dL"
  },

  phosphorus: {
    aliases: ["phosphorus"],
    normal_min: 2.5,
    normal_max: 4.5,
    unit: "mg/dL"
  },

  // LIPID PROFILE
  cholesterol: {
    aliases: ["cholesterol", "total cholesterol"],
    normal_min: 120,
    normal_max: 200,
    unit: "mg/dL"
  },

  hdl: {
    aliases: ["hdl", "hdl cholesterol"],
    normal_min: 40,
    normal_max: 60,
    unit: "mg/dL"
  },

  ldl: {
    aliases: ["ldl", "ldl cholesterol"],
    normal_min: 0,
    normal_max: 100,
    unit: "mg/dL"
  },

  triglycerides: {
    aliases: ["triglycerides"],
    normal_min: 0,
    normal_max: 150,
    unit: "mg/dL"
  },

  // HORMONES
  testosterone: {
    aliases: ["testosterone"],
    normal_min: 300,
    normal_max: 1000,
    unit: "ng/dL"
  },

  progesterone: {
    aliases: ["progesterone", "17 oh progesterone"],
    normal_min: 0,
    normal_max: 20,
    unit: "ng/mL"
  },

  acth: {
    aliases: ["acth", "adrenocorticotropic hormone"],
    normal_min: 7,
    normal_max: 63,
    unit: "pg/mL"
  },

  adh: {
    aliases: ["adh", "antidiuretic hormone"],
    normal_min: 0,
    normal_max: 5,
    unit: "pg/mL"
  },

  // URINE
  urine_protein: {
    aliases: ["urine protein"],
    normal_min: 0,
    normal_max: 150,
    unit: "mg/24h"
  },

  urine_creatinine: {
    aliases: ["urine creatinine"],
    normal_min: 20,
    normal_max: 275,
    unit: "mg/24h"
  },

  urine_albumin: {
    aliases: ["urine albumin", "microalbumin"],
    normal_min: 0,
    normal_max: 30,
    unit: "mg/24h"
  },

  urine_sodium: {
    aliases: ["urine sodium"],
    normal_min: 40,
    normal_max: 220,
    unit: "mmol/24h"
  },

  urine_potassium: {
    aliases: ["urine potassium"],
    normal_min: 25,
    normal_max: 125,
    unit: "mmol/24h"
  }

};