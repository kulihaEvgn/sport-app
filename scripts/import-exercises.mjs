// Импорт упражнений из docs/ТРЕНИРОВКИ.pdf в БД.
// Запуск: node scripts/import-exercises.mjs
// Идемпотентен по name + muscleGroup (skip если уже есть).

import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

config()

const prisma = new PrismaClient()

const Y = (id) => id ? `https://www.youtube.com/shorts/${id}` : undefined

const exercises = [
  // ─── СПИНА ────────────────────────────────────────────────────────────
  { name: 'Подтягивания широким хватом',                              muscleGroup: 'back', equipment: 'Без инвентаря', videoUrl: Y('0lMFlH3TyaI') },
  { name: 'Подтягивания параллельным хватом',                         muscleGroup: 'back', equipment: 'Без инвентаря', videoUrl: Y('JZei52P5SbE') },
  { name: 'Подтягивания обратным хватом',                             muscleGroup: 'back', equipment: 'Без инвентаря', videoUrl: Y('JZei52P5SbE') },
  { name: 'Вертикальная тяга блока широким хватом',                   muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('WVtkxdAoDqs') },
  { name: 'Вертикальная тяга блока параллельным хватом',              muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('JtiAnzniARA') },
  { name: 'Вертикальная тяга блока узким хватом',                     muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('qxAjVptyK-4') },
  { name: 'Тяга верхнего блока с упором в скамью',                    muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('0ayoTx-q6mc') },
  { name: 'Тяга верхнего блока по 1-й руке с упором в скамью',        muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('ATERaZ-MDk0') },
  { name: 'Тяга верхних блоков с упором в скамью',                    muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('2rWKSc19bYk') },
  { name: 'Тяга верхних блоков в кроссовере на коленях',              muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('EclcGrTRNAc') },
  { name: 'Рычажная верхняя тяга',                                    muscleGroup: 'back', equipment: 'Тренажёр',      videoUrl: Y('-tSB3bB2dl0') },
  { name: 'Горизонтальная тяга блока с акцентом на ширину',           muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('1iU65ToLyB0') },
  { name: 'Горизонтальная тяга блока с акцентом на толщину',          muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('AAcBr0poYEY') },
  { name: 'Горизонтальная тяга блока по 1-й руке',                    muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('ANLNqnvtn5I') },
  { name: 'Тяга нижнего блока с упором в скамью',                     muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('r0d0RCR5hJ4') },
  { name: 'Тяга нижнего блока по 1-й руке с упором в скамью',         muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('Qkm4RoaoJ1A') },
  { name: 'Тяга нижнего блока по 1-й руке',                           muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('xP_dvuHGDfM') },
  { name: 'Тяга нижнего блока стоя',                                  muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('IGOY3J1sxG0') },
  { name: 'Рычажная горизонтальная тяга двумя руками',                muscleGroup: 'back', equipment: 'Тренажёр',      videoUrl: Y('esW6qhI3q9w') },
  { name: 'Рычажная горизонтальная тяга по 1-й руке',                 muscleGroup: 'back', equipment: 'Тренажёр',      videoUrl: Y('Oj_F4Cg5UVo') },
  { name: 'Тяга к поясу в тренажере сидя',                            muscleGroup: 'back', equipment: 'Тренажёр',      videoUrl: Y('C7cA9PeiRlM') },
  { name: 'Тяга штанги в наклоне',                                    muscleGroup: 'back', equipment: 'Штанга',        videoUrl: Y('MnvrQP1rE8o') },
  { name: 'Тяга к поясу в Смите',                                     muscleGroup: 'back', equipment: 'Тренажёр',      videoUrl: Y('MnvrQP1rE8o') },
  { name: 'Тяга двух гантелей в наклоне',                             muscleGroup: 'back', equipment: 'Гантели',       videoUrl: Y('0KMy9im_F54') },
  { name: 'Тяга гантелей в наклоне по 1-й руке',                      muscleGroup: 'back', equipment: 'Гантели',       videoUrl: Y('aAPFWsr84hA') },
  { name: 'Тяга грифа по 1-й руке',                                   muscleGroup: 'back', equipment: 'Штанга',        videoUrl: Y('Dewb52CdftI') },
  { name: 'Тяга гантелей с упором в скамью',                          muscleGroup: 'back', equipment: 'Гантели',       videoUrl: Y('J_qqm8yZFBM') },
  { name: 'Тяга Т-грифа с упором',                                    muscleGroup: 'back', equipment: 'Штанга' },
  { name: 'Тяга Т-грифа',                                             muscleGroup: 'back', equipment: 'Штанга',        videoUrl: Y('0cAZ3zUn37Q') },
  { name: 'Тяга Т-грифа без Т-грифа',                                 muscleGroup: 'back', equipment: 'Штанга',        videoUrl: Y('0cAZ3zUn37Q') },
  { name: 'Пулловер в блоке',                                         muscleGroup: 'back', equipment: 'Блок',          videoUrl: Y('5HY5FXOUIWk') },
  { name: 'Пулловер в блоке с упором спиной',                         muscleGroup: 'back', equipment: 'Блок',          videoUrl: 'https://www.youtube.com/watch?v=DiO10H1UTZU' },
  { name: 'Шраги со свободным весом / в блоке',                       muscleGroup: 'back', equipment: 'Штанга',        videoUrl: Y('TRHrJiqu_3A') },
  { name: 'Гиперэкстензия',                                           muscleGroup: 'back', equipment: 'Тренажёр',      videoUrl: Y('T8D6lS13hdw') },
  { name: 'Экстензия на полу',                                        muscleGroup: 'back', equipment: 'Без инвентаря', videoUrl: Y('dk9UewhG244') },

  // ─── ГРУДЬ ────────────────────────────────────────────────────────────
  { name: 'Жим штанги в наклоне',                                     muscleGroup: 'chest', equipment: 'Штанга',       videoUrl: Y('NH12NRdxyDg') },
  { name: 'Жим в Смите в наклоне',                                    muscleGroup: 'chest', equipment: 'Тренажёр',     videoUrl: Y('UA2uuAElBcE') },
  { name: 'Жим гантелей в наклоне',                                   muscleGroup: 'chest', equipment: 'Гантели',      videoUrl: Y('CAXdA9iEXco') },
  { name: 'Жим штанги лежа',                                          muscleGroup: 'chest', equipment: 'Штанга',       videoUrl: Y('7nElIaNfJCU') },
  { name: 'Жим лежа в Смите',                                         muscleGroup: 'chest', equipment: 'Тренажёр',     videoUrl: Y('EKORkfmdgoQ') },
  { name: 'Жим гантелей лежа',                                        muscleGroup: 'chest', equipment: 'Гантели',      videoUrl: Y('RF_Z4an3FTM') },
  { name: 'Отжимания на брусьях с акцентом на грудь',                 muscleGroup: 'chest', equipment: 'Тренажёр',     videoUrl: Y('34L6fAj63Ds') },
  { name: 'Жим в Хаммере на верх груди',                              muscleGroup: 'chest', equipment: 'Тренажёр',     videoUrl: Y('_pbCAfy8vDM') },
  { name: 'Жим в Хаммере на низ груди',                               muscleGroup: 'chest', equipment: 'Тренажёр',     videoUrl: Y('ppVWVWaijPw') },
  { name: 'Жим вниз в тренажере',                                     muscleGroup: 'chest', equipment: 'Тренажёр',     videoUrl: Y('9dKyUjkgocI') },
  { name: 'Сведение в Peck-Deck на верх груди',                       muscleGroup: 'chest', equipment: 'Тренажёр',     videoUrl: Y('Jdj_asaMtvM') },
  { name: 'Сведение в Peck-Deck на низ груди',                        muscleGroup: 'chest', equipment: 'Тренажёр',     videoUrl: Y('Jdj_asaMtvM') },
  { name: 'Сведение в кроссовере стоя',                               muscleGroup: 'chest', equipment: 'Блок',         videoUrl: Y('5bBYLCo_lKU') },
  { name: 'Сведение в кроссовере лежа на наклонной скамье',           muscleGroup: 'chest', equipment: 'Блок',         videoUrl: Y('xODrGtCD-M') },
  { name: 'Сведение гантелей лежа',                                   muscleGroup: 'chest', equipment: 'Гантели',      videoUrl: Y('ek9hoBP3Knw') },
  { name: 'Пуловер с гантелью на грудь',                              muscleGroup: 'chest', equipment: 'Гантели',      videoUrl: Y('fnIR3mVGsuU') },

  // ─── НОГИ, ЯГОДИЦЫ, ИКРЫ ──────────────────────────────────────────────
  { name: 'Приседания со штангой',                                    muscleGroup: 'legs', equipment: 'Штанга',        videoUrl: Y('OZIvM5RfwSw') },
  { name: 'Приседания в Смите',                                       muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('4SAL2nh4e2g') },
  { name: 'Приседания в Смите с узкой постановкой ног',               muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('ORBL1vvk6_I') },
  { name: 'Приседания в Смите с акцентом на ягодицы',                 muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('QPzQBMmmQ4A') },
  { name: 'Приседания в Гакке',                                       muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('bmXRE774bvY') },
  { name: 'Обратные приседания в Гакке',                              muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('pw0wOg3UTQA') },
  { name: 'Фронтальный присед',                                       muscleGroup: 'legs', equipment: 'Штанга',        videoUrl: Y('hT4Sg2IqQG8') },
  { name: 'Приседания с гантелью на груди',                           muscleGroup: 'legs', equipment: 'Гантели',       videoUrl: Y('HBq-zmYZdHA') },
  { name: 'Приседания плие с гантелью',                               muscleGroup: 'legs', equipment: 'Гантели',       videoUrl: Y('08rv9RYXUs8') },
  { name: 'Приседания с нижним блоком',                               muscleGroup: 'legs', equipment: 'Блок',          videoUrl: Y('Kjab8QvtBvs') },
  { name: 'Выпады с гантелями / штангой',                             muscleGroup: 'legs', equipment: 'Гантели',       videoUrl: Y('ukabBzBGVO0') },
  { name: 'Выпады в Смите с акцентом на ягодицы',                     muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('rdjBB7uIf14') },
  { name: 'Выпады с гантелями с акцентом на ягодицы',                 muscleGroup: 'legs', equipment: 'Гантели',       videoUrl: Y('Y8AdVQdFRwU') },
  { name: 'Болгарские выпады в Смите',                                muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('OIQxgDawirk') },
  { name: 'Болгарские выпады с гантелями',                            muscleGroup: 'legs', equipment: 'Гантели',       videoUrl: Y('4FOZLx9Gxbs') },
  { name: 'Жим ногами',                                               muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('pdmAAyqaJos') },
  { name: 'Жим ногами с акцентом на ягодицы',                         muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('lhyzNK9gPsU') },
  { name: 'Жим ногами в тренажере сидя',                              muscleGroup: 'legs', equipment: 'Тренажёр' },
  { name: 'Разгибания ног в тренажере',                               muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('U8ZffVs9dw') },
  { name: 'Сгибания ног лежа в тренажере на бицепс бедра',            muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('q3S7FYIehQU') },
  { name: 'Сгибания ног на бицепс бедра в тренажере стоя по 1-й ноге', muscleGroup: 'legs', equipment: 'Тренажёр',     videoUrl: Y('07k0M54QF1c') },
  { name: 'Сгибания ног с гантелью на бицепс бедра',                  muscleGroup: 'legs', equipment: 'Гантели',       videoUrl: Y('jOfM3d2otQA') },
  { name: 'Мертвая тяга',                                             muscleGroup: 'legs', equipment: 'Штанга',        videoUrl: Y('lmftWWJDpM') },
  { name: 'Румынская тяга',                                           muscleGroup: 'legs', equipment: 'Штанга',        videoUrl: Y('F7VMXRuSGNg') },
  { name: 'Румынская тяга по 1-й ноге',                               muscleGroup: 'legs', equipment: 'Гантели',       videoUrl: Y('ug4I21Z_aK0') },
  { name: 'Ягодичный мостик',                                         muscleGroup: 'legs', equipment: 'Штанга',        videoUrl: Y('BNWY9PunWR0') },
  { name: 'Отведение ноги в кроссовере',                              muscleGroup: 'legs', equipment: 'Блок',          videoUrl: Y('qF387vn2qCA') },
  { name: 'Сведения ног в тренажере',                                 muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('kMTTXPK0L8A') },
  { name: 'Разведения ног в тренажере',                               muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('h9qlAX_DaZI') },
  { name: 'Экстензия с акцентом на ягодицы',                          muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('tPMi3GX22Nw') },
  { name: 'Тяга в Смите на ягодицы',                                  muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('pHnJ5iTvPbk') },
  { name: 'Тяга нижнего блока на ягодицы',                            muscleGroup: 'legs', equipment: 'Блок',          videoUrl: Y('UgHlvB1GJLM') },
  { name: 'Подъемы на носки в тренажере сидя',                        muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('2DAHyNcTtGA') },
  { name: 'Подъемы на носки в тренажере стоя / в Смите',              muscleGroup: 'legs', equipment: 'Тренажёр',      videoUrl: Y('ZBWBiCu_xJE') },
  { name: 'Подъемы на носки по 1-й ноге с гантелью',                  muscleGroup: 'legs', equipment: 'Гантели',       videoUrl: Y('KI8xtZRdfjk') },

  // ─── ПЛЕЧИ ────────────────────────────────────────────────────────────
  { name: 'Жим в Смите сидя',                                         muscleGroup: 'shoulders', equipment: 'Тренажёр', videoUrl: Y('nH1yqCId97c') },
  { name: 'Жим гантелей сидя',                                        muscleGroup: 'shoulders', equipment: 'Гантели',  videoUrl: Y('_Hng2oWkj3w') },
  { name: 'Жим в тренажере сидя / в Хаммере на плечи',                muscleGroup: 'shoulders', equipment: 'Тренажёр', videoUrl: Y('zI5KNfRrnuA') },
  { name: 'Подъемы рук перед собой',                                  muscleGroup: 'shoulders', equipment: 'Гантели',  videoUrl: Y('bajgzWnsYds') },
  { name: 'Подъемы рук с канатом перед собой',                        muscleGroup: 'shoulders', equipment: 'Блок',     videoUrl: Y('q6-z5Ogd7dM') },
  { name: 'Протяжка со штангой',                                      muscleGroup: 'shoulders', equipment: 'Штанга',   videoUrl: Y('_tmgA5x1z4') },
  { name: 'Протяжка с нижнего блока',                                 muscleGroup: 'shoulders', equipment: 'Блок',     videoUrl: Y('7TVpuq6Stkg') },
  { name: 'Протяжка с гантелями',                                     muscleGroup: 'shoulders', equipment: 'Гантели',  videoUrl: Y('kz1jcTSCM7c') },
  { name: 'Отведение гантелей в стороны стоя',                        muscleGroup: 'shoulders', equipment: 'Гантели',  videoUrl: Y('sae4gLqTFEs') },
  { name: 'Отведение гантелей с упором в скамью',                     muscleGroup: 'shoulders', equipment: 'Гантели',  videoUrl: Y('nMz2V_3WCZs') },
  { name: 'Отведение рук в тренажере сидя',                           muscleGroup: 'shoulders', equipment: 'Тренажёр', videoUrl: Y('t6S51ab8Lkw') },
  { name: 'Отведение в кроссовере по 1-й руке',                       muscleGroup: 'shoulders', equipment: 'Блок',     videoUrl: Y('9fF7OUuzjMM') },
  { name: 'Отведение рук в кроссовере лежа',                          muscleGroup: 'shoulders', equipment: 'Блок',     videoUrl: Y('HgkIGr6nMVA') },
  { name: 'Разведение на заднюю дельту в Peck-Deck',                  muscleGroup: 'shoulders', equipment: 'Тренажёр', videoUrl: Y('SpeJD8WSRP0') },
  { name: 'Разведение гантелей сидя в наклоне',                       muscleGroup: 'shoulders', equipment: 'Гантели',  videoUrl: Y('t-ul2Wr9IKU') },
  { name: 'Разведение гантелей с упором в скамью (задняя дельта)',    muscleGroup: 'shoulders', equipment: 'Гантели',  videoUrl: Y('dOrZ_MHKUBo') },
  { name: 'Тяга каната на заднюю дельту',                             muscleGroup: 'shoulders', equipment: 'Блок',     videoUrl: Y('kB9s5rFOlxQ') },
  { name: 'Разведение рук на заднюю дельту в кроссовере',             muscleGroup: 'shoulders', equipment: 'Блок',     videoUrl: Y('OahstM_1UAg') },
  { name: 'Тяга гантели по 1-й руке на заднюю дельту',                muscleGroup: 'shoulders', equipment: 'Гантели',  videoUrl: Y('g02vz5gj7bI') },

  // ─── БИЦЕПС, ПРЕДПЛЕЧЬЯ ───────────────────────────────────────────────
  { name: 'Подъем штанги на бицепс',                                  muscleGroup: 'biceps', equipment: 'Штанга',      videoUrl: Y('_8l82_jZl3Y') },
  { name: 'Подъем гантелей на бицепс',                                muscleGroup: 'biceps', equipment: 'Гантели',     videoUrl: Y('Yl4kLrhzj6Q') },
  { name: 'Подъем гантелей на бицепс сидя',                           muscleGroup: 'biceps', equipment: 'Гантели',     videoUrl: Y('cACziKO2DFw') },
  { name: 'Подъем штанги на бицепс с коленей',                        muscleGroup: 'biceps', equipment: 'Штанга',      videoUrl: Y('UnMG1PcEqTQ') },
  { name: 'Сгибания рук с нижнего блока',                             muscleGroup: 'biceps', equipment: 'Блок',        videoUrl: Y('-k_vFGb4Lbw') },
  { name: 'Сгибания рук в тренажере Скотта',                          muscleGroup: 'biceps', equipment: 'Тренажёр',    videoUrl: Y('J_VVlkVzH38') },
  { name: 'Подъем штанги на бицепс на скамье Скотта',                 muscleGroup: 'biceps', equipment: 'Штанга',      videoUrl: Y('nfRy-fsB2o') },
  { name: 'Сгибания по 1-й руке с гантелью с упором руки в скамью',   muscleGroup: 'biceps', equipment: 'Гантели',     videoUrl: Y('xdJnGqpKfMw') },
  { name: 'Подъем гантелей с упором в скамью',                        muscleGroup: 'biceps', equipment: 'Гантели',     videoUrl: Y('IUYZ_XBO36g') },
  { name: 'Подъем штанги с упором в скамью',                          muscleGroup: 'biceps', equipment: 'Штанга',      videoUrl: Y('JbRsHIJZyNI') },
  { name: 'Подъем гантелей на бицепс сидя на наклонной скамье',       muscleGroup: 'biceps', equipment: 'Гантели',     videoUrl: Y('bmMpgxzJhWE') },
  { name: 'Подъем гантелей на бицепс сидя с упором сзади',            muscleGroup: 'biceps', equipment: 'Гантели',     videoUrl: Y('dVA5dXzBH68') },
  { name: 'Сгибания по 1-й руке нижнего блока сзади',                 muscleGroup: 'biceps', equipment: 'Блок',        videoUrl: Y('_RMCVek_hus') },
  { name: 'Сгибания по 1-й руке с нижнего блока с упором в скамью',   muscleGroup: 'biceps', equipment: 'Блок',        videoUrl: Y('-Fvkc0r7LgE') },
  { name: 'Подъем штанги верхним хватом',                             muscleGroup: 'biceps', equipment: 'Штанга',      videoUrl: Y('_GV_sYdgXLw') },
  { name: 'Молотки с гантелями',                                      muscleGroup: 'biceps', equipment: 'Гантели',     videoUrl: Y('Q1ROrn-Nuso') },
  { name: 'Молотки с канатом',                                        muscleGroup: 'biceps', equipment: 'Блок',        videoUrl: Y('ozHyAhP8ZFs') },
  { name: 'Молотки с гантелями сидя',                                 muscleGroup: 'biceps', equipment: 'Гантели',     videoUrl: Y('Tj6ZbH0CDz4') },
  { name: 'Сгибания кистей со штангой на скамье',                     muscleGroup: 'biceps', equipment: 'Штанга',      videoUrl: Y('ZXwYGSgWxsw') },
  { name: 'Сгибания кистей со штангой сзади',                         muscleGroup: 'biceps', equipment: 'Штанга',      videoUrl: Y('URkKSRENzUo') },

  // ─── ТРИЦЕПС ──────────────────────────────────────────────────────────
  { name: 'Жим штанги / в Смите узким хватом',                        muscleGroup: 'triceps', equipment: 'Штанга',     videoUrl: Y('K6nOH2OLHOs') },
  { name: 'Отжимания на брусьях с акцентом на трицепс',               muscleGroup: 'triceps', equipment: 'Тренажёр',   videoUrl: Y('IpdJQhixUfs') },
  { name: 'Жим вниз в тренажере с акцентом на трицепс',               muscleGroup: 'triceps', equipment: 'Тренажёр',   videoUrl: Y('AFs4YjoyI7o') },
  { name: 'Разгибания в блоке с прямой рукоятью',                     muscleGroup: 'triceps', equipment: 'Блок',       videoUrl: Y('ZJDVfLJms2s') },
  { name: 'Разгибания в блоке с канатом / двумя канатами',            muscleGroup: 'triceps', equipment: 'Блок',       videoUrl: Y('pp5VoBwsTU8') },
  { name: 'Разгибания в блоке лежа на скамье',                        muscleGroup: 'triceps', equipment: 'Блок',       videoUrl: Y('HgKy9Pr2EvU') },
  { name: 'Разгибания в блоке по 1-й руке',                           muscleGroup: 'triceps', equipment: 'Блок',       videoUrl: Y('WdGzJ-lZVMg') },
  { name: 'Разгибания с двух блоков в кроссовере',                    muscleGroup: 'triceps', equipment: 'Блок',       videoUrl: Y('wsVLiMiy8Qs') },
  { name: 'Французский жим на наклонной скамье',                      muscleGroup: 'triceps', equipment: 'Штанга',     videoUrl: Y('kqV-KmVnYfo') },
  { name: 'Французский жим с гантелями на наклонной скамье',          muscleGroup: 'triceps', equipment: 'Гантели',    videoUrl: Y('Hgk4L6s0l5Q') },
  { name: 'Разгибания из-за головы в блоке',                          muscleGroup: 'triceps', equipment: 'Блок',       videoUrl: Y('w3tzPoxhKQE') },
  { name: 'Разгибания из-за головы в блоке по 1-й руке',              muscleGroup: 'triceps', equipment: 'Блок',       videoUrl: Y('HObNZxHcfXM') },
  { name: 'Разгибания с гантелью из-за головы по 1-й руке',           muscleGroup: 'triceps', equipment: 'Гантели',    videoUrl: Y('xl6S_IhFCb4') },
  { name: 'Разгибания из-за головы одной гантелью двумя руками',      muscleGroup: 'triceps', equipment: 'Гантели',    videoUrl: Y('U_OQ0eHBFXk') },
  { name: 'Разгибания рук с гантелями стоя в наклоне',                muscleGroup: 'triceps', equipment: 'Гантели',    videoUrl: Y('4TA7lN5XX80') },
  { name: 'Отжимания с упором сзади',                                 muscleGroup: 'triceps', equipment: 'Без инвентаря', videoUrl: Y('YXfUibfUA4') },

  // ─── ПРЕСС ────────────────────────────────────────────────────────────
  { name: 'Молитва в блоке',                                          muscleGroup: 'core', equipment: 'Блок',          videoUrl: Y('TfUxOBcE1o') },
  { name: 'Подъемы ног в висе',                                       muscleGroup: 'core', equipment: 'Без инвентаря', videoUrl: Y('smyfMQh-Rms') },
  { name: 'Скручивания',                                              muscleGroup: 'core', equipment: 'Без инвентаря' },

  // ─── РАЗМИНКА ─────────────────────────────────────────────────────────
  { name: 'Разминка верха тела',                                      muscleGroup: 'other', equipment: 'Без инвентаря', videoUrl: Y('NgP5ePNPF8I') },
  { name: 'Разминка низа тела',                                       muscleGroup: 'other', equipment: 'Без инвентаря', videoUrl: Y('syQ_R_G6sX8') },
]

async function main() {
  const url = process.env.DATABASE_URL ?? ''
  const host = url.match(/@([^/]+)/)?.[1] ?? '(unknown host)'
  console.log(`Importing ${exercises.length} exercises into: ${host}`)

  let created = 0
  let skipped = 0
  for (const ex of exercises) {
    const existing = await prisma.exercise.findFirst({ where: { name: ex.name, muscleGroup: ex.muscleGroup } })
    if (existing) { skipped++; continue }
    await prisma.exercise.create({ data: ex })
    created++
  }

  console.log(`Created: ${created}, skipped (already existed): ${skipped}`)
  const total = await prisma.exercise.count()
  console.log(`Total exercises in DB: ${total}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
