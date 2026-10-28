/** 핵종 낱장의 **손글 단락** — 「이 핵종이 실무에서 어디서 만나지고 무엇이 문제가 되는가」(2026-10-04).
 *
 *  ★ 왜: 낱장 147장은 한 틀에서 나온 자료 쪽이고 색인 쪽의 72% 다. 되풀이를 66% → 28% 로 내리고 제목 틀을
 *    0건으로 만들었지만, **자료 쪽이라는 성격 자체**는 그대로다 — 애드센스 심사의 남은 불확실성 중 가장 큰
 *    것(「자동 생성 자료 쪽 묶음」으로 읽힐 가능성)이 여기 있다. 방문 집계 상위 20종(`rl_visits`, 2026-10-04)에
 *    산업·의료 현장에서 빠질 수 없는 여섯(H-3·F-18·Tc-99m·I-125·Se-75·Cf-252)을 더해 **26장**에 손으로 쓴 글을 둔다.
 *  ★★ 규칙 — ① **숫자를 적지 않는다.** 반감기·에너지·선량률은 쪽의 표가 자료에서 든다. 글에 적으면 자료가
 *    바뀔 때 따라오지 않아 조용히 낡는다(그림 속 숫자와 같은 함정). 핵종 표기(`Ba-137m`)의 숫자만 예외다 —
 *    `check-nuclides` ⑦ 이 잰다. ② 비유·의인화 없음, 제목은 명사구(`docs/writing-style.md` 와 같은 결).
 *    ③ 글은 **그 쪽의 표가 못 드는 것**을 말한다 — 어디서 만나는가 · 무엇이 측정·차폐·취급을 가르는가 ·
 *    표의 숫자를 읽을 때 빠지기 쉬운 것. 쪽마다 다른 사실만 적고 일반론은 허브로 보낸다. ④ 두 글이 여덟 낱말
 *    이상 같은 구절을 공유하지 않는다(⑦ 이 잰다).
 *  ★ 영국식 철자(metre · sterilisation · ionisation) — 사이트의 다른 글과 같다.
 *  ★★ **쪽이 없는 핵종의 글도 지우지 않는다**(2026-10-06 ④ — 검색 제외 77장을 지운 날). 글은 147장 전부 여기 남지만
 *    **그려지는 것은 쪽이 있는 핵종의 글뿐**이다(쪽 목록 `lib/nuclide-pages.ts`). 되살릴 때 목록에 넣기만 하면 그 쪽에
 *    다시 서고, 그때 `check-nuclides` ④-3 이 그 글을 다시 잰다(지금은 쪽 없는 글을 재지 않는다 — 10-05 에 147장 전부 통과했다). */
export interface NuclideNote {
  /** 명사구. 핵종 이름을 들어도 되지만 게이트는 이름을 지우고 틀을 비교하므로 **역할 낱말**이 갈라야 한다. */
  heading: string;
  paragraphs: string[];
  /** ★ 2026-10-28(T7) — 출처. 있으면 글 아래 「Sources」 목록으로 그리고, 구조화 데이터의 쪽 설명이 글의 첫 문장이 된다.
   *  `href` 가 없는 것은 링크 없이 이름만 나간다(주소를 확인하지 못한 문서 — 지어낸 주소를 달지 않는다).
   *  문서 번호의 숫자는 「글 속 숫자」가 아니다 — 목록은 `<p>` 가 아니라서 ④-3 이 글로 세지 않는다. */
  sources?: { label: string; href?: string }[];
}

/** ★★ **Search Console 노출 상위 20종**(2026-10-28 실측, 3개월 9/9~10/25 — 핵종 쪽 노출 1,864 중 이 20장) — 소유주 「상위 20쪽
 *  고유 해설을 하자」(T7). 이 20편은 300~600어 · 출처 둘 이상(링크) · 서로 같은 문장 0 이다(`check-nuclides` ④-4).
 *  나머지 글은 그전 규칙(120어 이상) 그대로다. 노출 순서 그대로 둔다 — 보고서 · 게이트가 이 순서로 적는다. */
export const GSC_TOP20: readonly string[] = ["Co-60", "U-236", "Sr-90", "Cs-137", "Ba-133", "Am-241", "Co-57", "Xe-133", "Ra-226", "Ra-228", "Ra-224", "Th-232", "I-131", "Pu-239", "Tc-99m", "F-18", "Na-22", "U-238", "Se-75", "Ni-63"];

/** ★★ **2차 20종**(2026-10-29, T10-②) — 해설 없는 색인 40쪽 가운데 「다른 쪽에도 있는 문장 틀」의 몫이 큰 20쪽(T10-① 실측 81.5~65.2%).
 *  애드센스 「비슷한 쪽이 많으면 쪽마다 고유 내용으로 늘리거나 합쳐라」(answer 10015918)에 대한 답이고, 소유주 결정(지우지 · 합치지 ·
 *  noindex 하지 않는다)에 따라 **늘린다.** 기준은 `GSC_TOP20` 과 같다 — `check-nuclides` ④-4 가 두 목록 40편을 함께 잰다. 틀 몫 순서 그대로. */
export const NOTES_ROUND2: readonly string[] = ["Pu-238", "Pu-240", "Kr-85", "Sm-153", "Mo-99", "Ce-139", "Eu-152", "Eu-154", "I-125", "In-111", "Cm-244", "Cd-109", "Pb-210", "U-234", "Cs-134", "Ga-67", "Lu-177", "Re-188", "Sb-124", "Tl-201"];

/** 글의 첫 문장 — 구조화 데이터(TechArticle)의 쪽 설명으로 쓴다(쪽에 실제로 보이는 문장). 마침표 뒤 공백 + 대문자에서 자른다. */
export const noteFirstSentence = (n: NuclideNote): string => {
  const p = n.paragraphs[0] ?? "";
  const m = p.match(/^(.+?[.!?])\s+(?=[A-Z])/);
  return m ? m[1] : p;
};

export const NUCLIDE_NOTES: Record<string, NuclideNote> = {
  "Am-241": {
    heading: "Am-241 in smoke detectors, gauges and neutron sources",
    paragraphs: [
      "Am-241 is the alpha emitter inside ionisation-chamber smoke detectors, where a few tens of kilobecquerels ionise the air gap and a smoke particle changes the current. It has also served as the excitation source in some portable X-ray fluorescence analysers, most of which now use miniature X-ray tubes, and it is the gamma source in some density and thickness gauges, and, mixed with beryllium, the alpha emitter of AmBe neutron sources used in well logging and moisture gauges. In aged plutonium it grows in from the decay of Pu-241, which is why the surface dose rate of old plutonium is higher than that of fresh material.",
      "The external hazard is governed by one low-energy photon line that the table below shows carrying most of the dose rate, with the remainder from a still softer line. A line that soft is largely removed by a few millimetres of steel and almost entirely by a millimetre or so of lead, so a shielded source can read almost nothing on a dose rate meter while the activity inside is substantial. The intake hazard is the opposite case: once inhaled or ingested, the alpha energy is delivered to bone surfaces and liver, and the dose coefficient per becquerel is among the highest of the common nuclides.",
      "When reading this page, treat the half-value layer in lead as a statement about the photon, not about the source: a smoke-detector foil reads almost nothing because its activity is tiny, whereas a bare AmBe source adds a neutron field that no photon figure here describes.",
      "That soft photon is also a measurement asset. Lung and wound counters fitted with thin scintillators or planar germanium detectors find Am-241 at amounts far below those at which plutonium could be seen directly, so in plutonium facilities the americium is what gets measured and the plutonium intake is inferred from the known isotopic make-up of the material handled. The chest-wall thickness or wound depth, which attenuate so soft a line strongly, is then the largest term in the uncertainty.",
      "An AmBe source needs a neutron survey instrument as well as a photon meter, and its storage design starts from hydrogen-rich moderator rather than from lead.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Americium-241", href: "https://www.epa.gov/radiation/radionuclide-basics-americium-241" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
    ],
  },
  "Co-60": {
    heading: "Co-60 in irradiators, radiography and calibration fields",
    paragraphs: [
      "Co-60 is produced by neutron activation of natural cobalt and is the radionuclide behind industrial gamma irradiators for medical-device sterilisation and food treatment, behind gamma radiography of thick steel, and, in regions where it is still in service, behind cobalt teletherapy units. Secondary standard calibration fields for dose rate instruments are commonly realised with Co-60 alongside Cs-137 because its two high-energy photons give a well-defined, penetrating field.",
      "The same activation route makes Co-60 the dominant external dose contributor during the first decades of reactor decommissioning: cobalt is a trace impurity in stainless steels and the main constituent of the cobalt-based hard-facing alloys used on valve seats, and every component that saw a neutron flux carries it. Its half-life, visible in the decay table below, is short enough that storage for a few decades removes most of it.",
      "The two photon lines are close in energy and both penetrating, so the shielding table here is unusually representative: the half-value layer in lead or concrete applies to the whole spectrum rather than to one line. The figure to remember from the limits section is the dose rate at a metre from a gigabecquerel, because irradiator loadings are measured in petabecquerels.",
      "Cobalt teletherapy made megavoltage radiotherapy widely available from the middle of the twentieth century, and the nuclide still loads the close to two hundred small sources of a Gamma Knife for stereotactic radiosurgery. Where linear accelerators have replaced the old units, the retired heads are among the most active disused sources a country has to manage, and the IAEA scheme for categorising sealed sources puts irradiator and teletherapy loadings in its most dangerous category, with security arrangements to match.",
      "A source loses roughly an eighth of its activity each year, so an irradiator operator adds fresh pencils to the rack instead of replacing it, and a calibration laboratory decay-corrects its reference dose rates at every use. When a disused source slips out of control and is melted with scrap, the cobalt follows the iron into the product; contaminated steel from such events is why steelworks and scrap yards screen incoming loads with radiation portal monitors.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Cobalt-60", href: "https://www.epa.gov/radiation/radionuclide-basics-cobalt-60" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "IAEA GSR Part 3, Radiation Protection and Safety of Radiation Sources: International Basic Safety Standards", href: "https://www.iaea.org/publications/8930/radiation-protection-and-safety-of-radiation-sources-international-basic-safety-standards" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
      { label: "IAEA Safety Guide RS-G-1.9, Categorization of Radioactive Sources" },
    ],
  },
  "Cs-137": {
    heading: "Cs-137 as a calibration source, a gauge source and a contaminant",
    paragraphs: [
      "Cs-137 is a fission product, and it reaches the field in two very different forms. As a sealed source it is the reference nuclide for dose rate calibration, the source in level and density gauges, and the former source in blood irradiators that are now being replaced. As a contaminant it is the long-lived signature of weapons fallout and of the Chernobyl and Fukushima releases, and it is the artificial nuclide most often found when food or soil is screened, and among the most frequent finds in scrap metal.",
      "The photon that defines Cs-137 is not emitted by Cs-137 at all. The decay feeds the metastable Ba-137m, which reaches equilibrium with its parent within minutes and emits the line that dominates the table below, the other entries being barium X-rays; a gamma spectrum of a caesium source is therefore a barium spectrum. Chemically, caesium chloride is a soluble, dispersible powder, which is why orphaned sources have caused contamination incidents out of proportion to their activity.",
      "For shielding, the single line makes the half- and tenth-value layers on this page directly usable, and the ratio between them is close to the single-energy value. For environmental work the relevant quantity is not the dose rate at a metre but the activity concentration, and the decay table is the tool for projecting how long a contaminated site remains above a clearance level.",
      "In soil, caesium is bound tightly by clay minerals and stays close to the surface for years, so contamination surveys report activity per unit area as well as per unit mass. An in-situ gamma spectrometer only gives a usable deposition figure once a depth profile is assumed: the same deposit worked a few centimetres into the ground reads markedly lower at the detector. For food the international reference points are the guideline levels of the Codex Alimentarius, alongside national limits that are set separately and often differ from them; this page supplies the decay arithmetic, not the limits.",
      "The caesium chloride form was at the centre of the Goiânia accident in Brazil, where a teletherapy head left in an abandoned clinic was broken open and the powder spread through a neighbourhood. The same chemistry is why source-security programmes are exchanging caesium blood irradiators for X-ray units: a tube that is switched off leaves nothing behind to lose.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Cesium-137", href: "https://www.epa.gov/radiation/radionuclide-basics-cesium-137" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "IAEA GSR Part 3, Radiation Protection and Safety of Radiation Sources: International Basic Safety Standards", href: "https://www.iaea.org/publications/8930/radiation-protection-and-safety-of-radiation-sources-international-basic-safety-standards" },
      { label: "Codex Alimentarius, General Standard for Contaminants and Toxins in Food and Feed (CXS 193-1995), radionuclide guideline levels" },
    ],
  },
  "Na-22": {
    heading: "Na-22 as a long-lived positron reference",
    paragraphs: [
      "Na-22 is a positron emitter with a half-life of years rather than minutes, and that combination is its whole value. Positron emission tomography (PET) scanners, coincidence counters and well counters are checked with Na-22 point or rod sources because the annihilation photons are the same ones the instruments are built to detect, while the activity stays usable for years. In materials science it is the standard positron source for positron annihilation lifetime spectroscopy, where the prompt gamma that follows each decay provides the start signal.",
      "About nine decays in ten produce the pair of annihilation photons, and almost every decay also gives a higher-energy gamma, and the table below shows how the dose rate divides between them. The annihilation photons are only produced where the positron stops, which is within the source encapsulation or the first millimetre of surrounding material; an unencapsulated Na-22 deposit behaves differently from a sealed one.",
      "Sources are usually small, and the handling question is contamination rather than external dose. The half-life, shown in the decay table, means a source bought for a scanner acceptance test is still usable at the next one, which is the practical reason it is chosen over F-18 for point-source checks that recur over years.",
      "Na-22 is also made in nature. Cosmic rays striking argon in the upper atmosphere produce it continuously, and air-filter monitoring stations record it together with Be-7 as a cosmogenic tracer of air exchange between the stratosphere and the troposphere. A small Na-22 peak in an air-filter spectrum is therefore not, by itself, evidence of a release.",
      "Laboratory sources come from an accelerator, and the two well-separated peaks they give, the annihilation line and the higher gamma, make Na-22 a convenient source for setting the energy scale and checking the linearity of a scintillation spectrometer. As the chloride it is soluble, so a damaged source spreads easily, and periodic wipe tests tell more about it than its dose rate does.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
    ],
  },
  "P-32": {
    heading: "P-32 as a high-energy pure beta emitter in laboratories",
    paragraphs: [
      "P-32 is a pure beta emitter with one of the highest beta endpoint energies among nuclides handled on the open bench. It labelled nucleic acids for decades in molecular biology, and it is still used in sodium phosphate form for some blood disorders and as a colloid for intracavitary therapy. Laboratory quantities are small, but the beta energy means that a drop on the back of a glove or a vial held in the hand delivers a skin dose that no other common laboratory nuclide matches.",
      "Two consequences follow from the energy. The first is bremsstrahlung: when the beta is stopped in a high-atomic-number material, part of its energy is converted to X-rays, so P-32 is shielded with acrylic or another low-atomic-number material first and lead, if at all, outside it. The table below gives the converted fraction for both choices. The second is that the betas are energetic enough to produce Cherenkov light in water, which allows counting without scintillation cocktail.",
      "The range table on this page is a stopping thickness for the endpoint, not an attenuation length; betas below the endpoint stop sooner. A thin-window Geiger–Müller detector responds well to P-32, which makes contamination surveys straightforward compared with the soft beta emitters that need swipes and liquid scintillation counting.",
    ],
  },
  "Co-57": {
    heading: "Co-57 for gamma camera checks and Mössbauer spectroscopy",
    paragraphs: [
      "Co-57 is the nuclide of the flood sources and marker sources used to check gamma cameras. Its principal photon lies close to the Tc-99m line that the cameras are tuned for, so a uniformity test with a Co-57 sheet source exercises the detector at a realistic energy without preparing a short-lived radiopharmaceutical. The same decay, through its iron daughter, is the source of the recoil-free gamma used in Mössbauer spectroscopy, where the Co-57 is diffused into a rhodium matrix.",
      "The photons are low in energy, as the table below shows, and are stopped by modest thicknesses of lead; the half-value layer figure here is small and the sources are easy to store. The half-life, under a year, sets a replacement cycle for flood sources and means that a disused source decays to background within a working lifetime.",
      "Electron capture produces iron X-rays alongside the gamma lines, and they appear in a spectrum below the main peaks. For uniformity testing the activity distribution across the sheet matters more than the absolute activity, and that is a property of the source manufacture that no figure on this page can confirm.",
      "Co-57 is made in a cyclotron, and a freshly produced source can carry traces of Co-56 and Co-58. Their harder photons pass through collimator septa and spoil a uniformity image out of proportion to their activity, so the radionuclidic purity statement on the certificate is worth reading; both contaminants are shorter-lived than Co-57 and matter most in the first months of a flood source's service.",
      "Sealed Co-57 vials are also among the reference sources for the accuracy and constancy tests of radionuclide dose calibrators, where they stand for the low-energy end of the range beside Ba-133 and Cs-137. Since the source loses half its activity in less than a year, a test schedule built on it needs a decay-corrected expected reading at every use rather than a fixed number on the wall.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
    ],
  },
  "Ni-63": {
    heading: "Ni-63 in electron capture detectors and activated steel",
    paragraphs: [
      "Ni-63 emits a very low-energy beta and nothing else, and that is why it sits inside the electron capture detector of a gas chromatograph: the betas ionise the carrier gas, and electronegative analytes reduce the standing current. The same property makes it one of the main isotopes, with tritium, for betavoltaic batteries, and the long half-life recorded in the decay table below is what gives those detectors and batteries their service life.",
      "In reactor steels Ni-63 is an activation product of natural nickel, alongside the longer-lived Ni-59, and it is one of the hard-to-measure nuclides in decommissioning characterisation. There is no photon to find it with, so it is inferred from scaling factors against Co-60 or determined radiochemically and counted by liquid scintillation.",
      "A sealed Ni-63 source reads next to nothing on a Geiger–Müller probe through its window, and that absence is not evidence of a leak-free source: a wipe counted by liquid scintillation, or in a windowless proportional counter, is the check that works. The beta range table on this page shows how little material stops the emission, which is the same fact seen from the other side.",
      "Electron capture detectors are licensed items in most jurisdictions, and the foil inside the cell is not opened or replaced by the user: servicing is done by the manufacturer or a licensed contractor, and the cell is returned to the supplier when the instrument is retired rather than scrapped with it. In decommissioning, the ratio of Ni-63 to Co-60 used as a scaling factor does not stay fixed. Co-60 decays far faster, so the ratio rises year by year, and a factor derived from older samples has to be decay-corrected for each waste package. Nickel-bearing parts that sat in the neutron flux, such as core internals, carry the largest inventories, while steam generator tubing carries Ni-63 only in the corrosion films deposited on it; sampling plans for the core components give Ni-63 particular weight.",
      "As an external hazard it barely exists, since the beta does not get through the dead outer layer of skin. The protection question is entirely contamination and intake, which is why regulatory attention on these detectors concerns custody and leak testing rather than dose rate.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "NIST ESTAR, stopping power and range tables for electrons", href: "https://physics.nist.gov/PhysRefData/Star/Text/ESTAR.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
    ],
  },
  "Ba-133": {
    heading: "Ba-133 as a multi-line calibration source and an iodine stand-in",
    paragraphs: [
      "Ba-133 decays by electron capture and emits a group of photon lines spread across the low and medium energy range, which is why it appears in many gamma spectrometry calibration sets. Its strongest line sits close to the principal line of I-131, and sealed Ba-133 standards are used as a long-lived stand-in for I-131 when thyroid uptake probes and dose calibrators are checked, since a true I-131 standard would decay within weeks.",
      "The spread of energies is also what the shielding table below reflects: the half-value layer is set by the harder lines and the tenth-value layer by them even more so, so the ratio between the two departs from the single-energy value. Caesium X-rays, emitted as the daughter Cs-133 settles after the electron capture, add to the low-energy end of any spectrum.",
      "The decay table shows a half-life long enough for one calibration source to serve an instrument through much of its working life. Coincidence summing is noticeable when a Ba-133 source is counted close to a detector, because several lines are emitted in cascade; an efficiency curve built from close-geometry Ba-133 points without correction will be biased.",
      "Outside the calibration room Ba-133 turns up as an activation product. Barium is a natural constituent of concrete and is added on purpose, as barite, to heavy shielding concrete; neutrons around reactors and high-energy accelerators convert part of it, so Ba-133 joins Eu-152 and Co-60 in the inventory of activated concrete that a decommissioning survey has to quantify and that sets how deep a wall must be scabbled.",
      "For efficiency calibration the practical choice is between correcting the summing and avoiding it. Moving the source further from the crystal reduces the effect at the cost of counting time; Monte Carlo or semi-empirical correction codes recover the close-geometry efficiency but need a faithful model of the detector. A mixed-nuclide standard that contains Ba-133 deserves the same care, since its summing error passes into every energy interpolated from the curve.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "LNHB / DDEP, Recommended nuclear data tables", href: "https://www.lnhb.fr/home/nuclear-data/nuclear-data-table/" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
    ],
  },
  "Ir-192": {
    heading: "Ir-192 in industrial radiography and high-dose-rate brachytherapy",
    paragraphs: [
      "Ir-192 is produced by neutron activation of natural iridium and is the standard source for gamma radiography of welds in pipelines, pressure vessels and structural steel, where its spectrum gives usable contrast on medium steel thicknesses with a source small enough to fit a projector. In medicine the same nuclide, in a miniature stepping source, delivers high-dose-rate brachytherapy. In both uses the activity is high, the source is moved remotely, and the recorded accidents involve a source that did not return to its shield.",
      "The spectrum consists of many lines in the middle energy range, listed in the table below with their share of the dose rate, and the shielding table reflects that spread. The half-life is short enough, as the decay table shows, that a radiography source is exchanged several times a year, which is itself a transport and handling operation.",
      "The figures table gives the dose rate at a metre for a bare source, which is the number a radiographer uses to set a controlled area. In a projector the collimator and the depleted uranium or tungsten shield reduce it by orders of magnitude; the figure applies the moment the source leaves the guide tube.",
    ],
  },
  "Sr-90": {
    heading: "Sr-90 with its daughter Y-90 in gauges, applicators and waste",
    paragraphs: [
      "Sr-90 is a fission product and a pure beta emitter, but almost nothing about a Sr-90 source is set by its own beta. Its daughter Y-90 reaches equilibrium within weeks and emits a far more energetic beta, so a Sr-90 source is in practice a Y-90 source with a long half-life. That pairing is used in thickness gauges for paper and plastic film, in ophthalmic applicators, and historically in radioisotope thermoelectric generators left at remote sites.",
      "The beta energy of the daughter brings the bremsstrahlung question: the fraction of beta energy converted to X-rays rises with the atomic number of the absorber, so shielding is acrylic first and lead, if needed, outside it. For intake the concern is that strontium follows calcium into bone, where the long half-life in the decay table means much of the activity stays in the skeleton for many years.",
      "Detection is direct with a thin-window Geiger–Müller probe because of the Y-90 beta, which is also why Sr-90 with its Y-90 is a standard high-energy beta reference source for contamination monitors. The range and bremsstrahlung figures on this page are for the beta of Sr-90 itself. The Y-90 beta has a far higher endpoint and travels several times further in any absorber, so for a source in equilibrium the Y-90 page is the one to read for shielding.",
      "Most of the Sr-90 in the environment came from atmospheric weapons testing and reached people through milk, because strontium travels with calcium from pasture to cow to bone; the surveys of children's milk teeth in the testing era measured exactly that uptake. Thermoelectric generators built around a ceramic strontium heat source have been found abandoned or damaged at remote coastal and northern sites, and recovering them has been a recurring task of international source-security programmes.",
      "In environmental samples the measurement is indirect. Strontium is first separated chemically with a carrier that gives the chemical yield; the sample is then either left for its Y-90 to grow back before beta counting, or the separated Y-90 is counted on its own by Cherenkov counting in a liquid scintillation counter. Either way the result rests on a recorded separation time and a yield, not on a peak in a spectrum.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Strontium-90", href: "https://www.epa.gov/radiation/radionuclide-basics-strontium-90" },
      { label: "NIST ESTAR, stopping power and range tables for electrons", href: "https://physics.nist.gov/PhysRefData/Star/Text/ESTAR.html" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
    ],
  },
  "C-14": {
    heading: "C-14 in tracer studies, dating and reactor graphite",
    paragraphs: [
      "C-14 is a soft, pure beta emitter with a half-life measured in thousands of years, and the two facts explain both of its roles. In the life sciences it labels organic molecules for metabolism and drug-disposition studies, where the long half-life means the label does not change during an experiment. In archaeology and geology the cosmogenic C-14 in once-living material is the clock of radiocarbon dating.",
      "In the nuclear fuel cycle it is an activation product of nitrogen impurities and of oxygen, and reactor graphite and some steels carry inventories that dominate the long-term inventory of a decommissioning waste stream. It has no photon, so it is measured by liquid scintillation after combustion or by accelerator mass spectrometry.",
      "A Geiger–Müller probe responds weakly to C-14 through its window and not at all through a glove, so contamination control depends on swipes and counting. The beta range table below shows the thickness that stops the emission entirely; for shielding purposes the question does not arise, and the issue in handling is volatile carbon dioxide from acidified solutions.",
      "Labelled compounds bring hazards of their own. Some organic solvents and labelled molecules pass through thin gloves, so the work uses two pairs and the outer pair is changed often, and the label follows the molecule into whichever organ metabolises it. In liquid scintillation counting the low beta energy makes the count sensitive to quenching by colour and chemical impurities in the sample, so each result needs a quench correction from an external standard or a spiked sample. At power stations the chemical form of a release matters as much as its quantity: pressurised water reactors discharge mostly methane and other hydrocarbons, while boiling water reactors release mainly carbon dioxide, which plants take up and pass into the food chain.",
    ],
  },
  "I-131": {
    heading: "I-131 in thyroid therapy, waste decay and effluent monitoring",
    paragraphs: [
      "I-131 is a fission product, although most of the medical supply is made by neutron irradiation of tellurium, and it is used therapeutically because the thyroid concentrates iodine: administered as iodide, it treats hyperthyroidism and ablates thyroid tissue after cancer surgery. It emits both a beta, which delivers the therapeutic dose locally, and photons, listed below, which make the patient a measurable external source and allow the uptake to be imaged.",
      "The decay table sets the clinical logistics: short enough that ward waste is held for decay rather than shipped, long enough that a treated patient carries measurable activity home. Patient release rules, the handling of excreta and the monitoring of hospital effluent all follow from that balance. Elemental iodine is volatile, so iodide solutions are handled in a fume cupboard and the worker's own thyroid is monitored.",
      "In gamma spectrometry the principal line is distinctive and is one of the first peaks sought after a reactor release, where its short half-life makes it the marker of a recent event. The shielding table here gives the layers for the photon component; the beta is stopped by the first few millimetres of any material and does not reach a person at a distance.",
      "Release criteria for treated patients rest on the dose expected to family members and the public, and countries express them differently: as retained activity, as a dose rate at a stated distance, or through an individual dose assessment. The IAEA guidance on patient release sets out the reasoning that national rules adapt. Excreted I-131 is regularly found in sewage sludge and in rivers below treatment works, which is why some therapy wards route their toilets to delay tanks.",
      "After a reactor accident the protective action specific to this nuclide is thyroid blocking with stable potassium iodide, taken shortly before or within a few hours after exposure, so that stable iodine saturates the gland and blocks further uptake. For staff who dispense therapy activities, a thyroid count with a collimated probe is the routine check that the fume cupboard and the handling procedure are working.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Iodine", href: "https://www.epa.gov/radiation/radionuclide-basics-iodine" },
      { label: "IAEA Safety Reports Series No. 63, Release of Patients After Radionuclide Therapy", href: "https://www.iaea.org/publications/8179/release-of-patients-after-radionuclide-therapy" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
    ],
  },
  "Pu-239": {
    heading: "Pu-239 as fissile material and as an intake hazard",
    paragraphs: [
      "Pu-239 is the fissile isotope bred from U-238 in reactors, present in spent fuel, recycled in mixed-oxide fuel and accounted for under international safeguards. In radiation protection it is an alpha emitter whose photons are weak, as the table below makes plain: the external dose rate from plutonium is small, and the hazard is chiefly the inhalation of fine oxide particles or entry through a contaminated wound, which deposit the alpha energy in lung, liver and bone over a lifetime.",
      "The weak photon emission is also what makes measurement difficult. Plutonium in a glovebox or a container is assayed from its low-energy X-rays and gammas with high-resolution detectors, from neutrons emitted in spontaneous fission and in alpha-neutron reactions on light elements, or, for aged material, from the Am-241 that has grown in from Pu-241. Alpha spectrometry and mass spectrometry are the laboratory methods.",
      "The decay table on this page spans a half-life long enough that no storage period reduces the inventory, which is why plutonium-bearing waste is a geological disposal question. The limits section states the consequence directly: for this nuclide the controlling dose is internal, and the figures above do not describe it.",
      "One reporting convention follows from the physics. The alpha energies of Pu-239 and Pu-240 lie too close together for an alpha spectrometer to separate, so environmental and bioassay results are routinely given as the sum of the two, and only mass spectrometry splits them. The ratio between them then distinguishes weapons fallout from plutonium made in power reactors.",
      "Fissile material is also governed by rules that have nothing to do with dose. Criticality safety limits the mass, geometry, concentration and moderation of plutonium at each process step, so a glovebox can be well within its dose constraints and still breach a criticality limit. Waste with appreciable plutonium content is classed as long-lived everywhere and, in some national systems, as a separate transuranic category destined for deep disposal.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Plutonium", href: "https://www.epa.gov/radiation/radionuclide-basics-plutonium" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
    ],
  },
  "Eu-152": {
    heading: "Eu-152 for detector efficiency calibration and in activated concrete",
    paragraphs: [
      "Eu-152 emits strong photon lines from tens of kiloelectronvolts to beyond a megaelectronvolt, so a single source covers much of the energy range over which a gamma spectrometer's efficiency curve is built. Its half-life, listed in the first table below, keeps a calibration source serviceable for a decade or more. It is made by neutron capture in Eu-151, and capture in Eu-153, the other natural isotope, gives Eu-154 alongside it.",
      "Most decays are electron captures to samarium, but a substantial minority are beta-minus decays to gadolinium, which give several prominent gamma lines in the photon table, while the X-rays listed there are samarium X-rays that follow electron capture. The same richness of lines causes errors at close geometry: several lines are emitted in cascade, and coincidence summing removes counts from one peak and adds them to a sum peak. An efficiency curve taken with the source on the detector cap will be wrong unless summing corrections are applied or the source is counted at a distance. On a detector sensitive to low-energy photons the X-rays from electron capture sum with gamma rays and with each other, so correction codes must handle every such coincidence.",
      "Neutron capture in the trace europium of concrete also produces Eu-152, so with Eu-154 it sets part of the dose rate when a reactor bioshield is dismantled. The shielding table here gives layers for the whole spectrum, dominated by the harder lines. The europium is only a trace, but its capture cross-section for thermal neutrons is very large, and reactor graphite is activated in the same way. Drilled cores measured along their length give the activation depth, and with it the volume of concrete to be managed as radioactive waste. Co-60 decays faster than either europium nuclide, so the longer dismantling is deferred, the larger the europium share of the gamma activity left in the concrete.",
      "Uranium- and thorium-series nuclides in the concrete itself emit lines that a germanium detector cannot resolve from some of the strongest Eu-152 lines, and Eu-154 has an intense line just above the main low-energy Eu-152 gamma. At low activity concentrations a figure taken from the high-energy peaks that coincide with natural lines overstates Eu-152 unless the natural contribution is estimated from other lines of the same series and subtracted. The low-energy peak needs a fit that separates the Eu-154 line.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "LNHB / DDEP, Recommended data: Eu-152 decay tables", href: "https://www.lnhb.fr/nuclides/Eu-152_tables.pdf" },
      { label: "IAEA Technical Reports Series No. 389, Radiological Characterization of Shut Down Nuclear Reactors for Decommissioning Purposes", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/TRS389_scr.pdf" },
      { label: "Jonsson, Kastlander, Vidmar and Ramebäck, Experimental validation of correction factors for γ–γ and γ–X coincidence summing of Ba-133, Eu-152 and Sb-125 in volume sources, Journal of Radioanalytical and Nuclear Chemistry (2020)", href: "https://doi.org/10.1007/s10967-019-06938-3" },
    ],
  },
  "Kr-85": {
    heading: "Kr-85 as a noble-gas beta source and a reprocessing tracer",
    paragraphs: [
      "Kr-85 is a radioactive noble gas, chemically inert and therefore useful where a source must not react or be absorbed. Its uses include thickness gauges for thin films and paper, leak testing of sealed components, and the starting aid in some discharge lamps. It is also a fission product released to the atmosphere when spent fuel is dissolved, and its global atmospheric concentration is a record of reprocessing activity. Neutron capture in stable Kr-84 also makes it, alongside the short-lived isomer Kr-85m, which decays within days.",
      "The radiation is almost entirely beta. The one photon line in the table below accompanies fewer than one decay in a hundred; the share column gives it the whole photon dose rate, and the figures table shows how small that component is. An inert gas is scarcely taken up by the body, so the dose from a release is external, to the skin and from immersion in the plume, rather than from intake; measurement in air uses flow-through counters or gas sampling followed by counting.",
      "A Kr-85 gauge source is a sealed volume of gas, and the leak test that matters is for the gas itself. A gauge serves for years on one filling, and the range table shows how little material stops the beta, the property the gauge exploits. Any added shielding should have plastic or aluminium, which produce little bremsstrahlung, next to the source and lead outside. The photon line lies too close to the annihilation peak for a sodium iodide detector to resolve, and Sr-85 emits the same line, so a peak there identifies Kr-85 only in krypton samples.",
      "German federal stations pump air for a week through charcoal cooled with liquid nitrogen; their laboratory removes carbon dioxide and lighter gases, separates krypton from xenon by gas chromatography and counts it in a proportional counter. Set beside southern-hemisphere series that Australian, French and Heidelberg University groups collected on the same principle, these records show the northern hemisphere well above the southern, and together they serve as input functions for dating young groundwater.",
      "Reprocessing plants have mostly discharged their krypton rather than trap it. Cryogenic capture requires nitrogen oxides and hydrocarbons to be removed first, because they can explode with oxygen. Captured gas would then need isolating, perhaps in cylinders, for over a century.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "LNHB / DDEP, Recommended nuclear data tables: Kr-85 (decay data, main production modes)", href: "https://www.lnhb.fr/nuclides/Kr-85_tables.pdf" },
      { label: "Kersting et al., Krypton-85 datasets of the northern and southern hemisphere collected over the past 60 years, Data in Brief 33 (2020)", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7691724/" },
      { label: "IAEA Bulletin, Y.V. Zabaluev, Management of radionuclides from reprocessing plant gaseous effluents (Vol. 21, No. 1)", href: "https://www.iaea.org/sites/default/files/publications/magazines/bulletin/bull21-1/21105642331.pdf" },
    ],
  },
  "Po-210": {
    heading: "Po-210 in static eliminators and in the natural radium chain",
    paragraphs: [
      "Po-210 is an alpha emitter with a half-life of months, found in static eliminator brushes and bars that neutralise charge on film, lenses and powders, and formerly used as a compact heat source. It is also the last radioactive member of the uranium series, which is why it is present in tobacco smoke, in seafood and in the environment generally.",
      "The alpha has no range outside the source, and this page lists no photon line at all: the one weak gamma of Po-210 accompanies so few decays that it does not appear in the dataset the page is built from, and a sealed source reads nothing on an ordinary dose rate meter. The hazard is intake: the alpha energy delivered per becquerel ingested or inhaled is very high, and Po-210 is among the most radiotoxic nuclides in common use.",
      "The short half-life, in the decay table, means static eliminators are replaced on a yearly cycle and that waste decays within a few years. Measurement is by alpha spectrometry after chemical separation, or, for surface contamination, by alpha-sensitive probes held close to the surface because the particles do not travel.",
      "In environmental and bioassay laboratories the chemistry is the hard part. Polonium is volatile, so samples are wet-digested with acids rather than ashed at high temperature, and Po-209 is added at the start as a yield tracer. The polonium then plates spontaneously onto a silver disc from dilute hydrochloric acid and is counted on a silicon detector. Because Po-210 grows in from Pb-210 by way of Bi-210, a sample left on the shelf does not keep its original polonium content: the separation date is recorded and the result is corrected back to the sampling date. Spent static eliminators are not ordinary waste either; under general-licence rules in many countries they go back to the supplier for disposal.",
    ],
  },
  "Mn-54": {
    heading: "Mn-54 as a corrosion-product activation nuclide",
    paragraphs: [
      "Mn-54 is produced when fast neutrons strike the iron in reactor steels, and it is carried around the primary circuit in corrosion products, where it contributes to the dose rate at pumps, steam generators and filters. During outages and decommissioning it is one of the first nuclides identified in gamma spectra of crud and resin, together with Co-60 and Co-58.",
      "It emits a single photon line, which the table below shows carrying the whole dose rate, so its spectrometry is uncomplicated and its shielding figures are those of a single energy. The half-life, under a year, means that Mn-54 dominates early and fades: a plant that has been shut down for a few years no longer shows it, and Co-60 remains.",
      "It is also a marker in environmental samples after a reactor release, where its ratio to longer-lived nuclides indicates how recently the material left the reactor. The decay table here gives the time for its activity to fall by successive factors of ten.",
    ],
  },
  "Cs-134": {
    heading: "Cs-134 as a reactor marker and a dating ratio with Cs-137",
    paragraphs: [
      "Cs-134 is not a direct fission product in significant yield; it is formed when the stable Cs-133 produced in fuel captures a neutron. Its presence therefore indicates irradiated fuel rather than a weapons source; against a known starting value the ratio of Cs-134 to Cs-137 in a sample dates the release, and corrected to a common date it distinguishes one accident's contamination from another's.",
      "The direct yield is small because fission fragments of that mass decay along their isobar only as far as stable Xe-134, short of caesium. Nearly every Cs-134 decay goes on to Ba-134; an electron-capture branch to Xe-134 is negligible. Since capture needs Cs-133 to build up first, the ratio to Cs-137 depends on fuel burnup and differs between cores, and after the Fukushima Daiichi accident ratios in deposited soil were used to attribute contamination to individual reactor units.",
      "It emits several photon lines, listed in the table below, and its spectrometry carries the same coincidence-summing caution as Eu-152 and Ba-133: counted close to a detector, the cascade lines sum and the apparent activity is biased. Set against Cs-137 the half-life is short, so Cs-134 fades from a contaminated area within a decade while Cs-137 remains.",
      "Summing is pronounced in the high-efficiency geometries used for food and soil, with the sample packed on or around the detector: the main lines lose counts, the weak crossover lines gain them, and a sum peak absent from the decay data appears. Japanese laboratories traced an underestimate of Cs-134 in a reference material to software corrections that ignored sample volume. In germanium the line carrying the largest dose share also sits within the resolution of an Ac-228 line from natural thorium; in sodium iodide the Cs-134 peaks overlap Cs-137 and Bi-214, so the isotopic ratio is usually measured with germanium.",
      "For shielding the spectrum is harder than that of Cs-137, and the half-value layer below is correspondingly larger. In food and soil monitoring shortly after a release the two caesium isotopes are reported together, and their ratio offers a check on whether the measurement is consistent with the event it is attributed to. Where both were deposited in comparable activities, as around Fukushima, Cs-134 gave most of the caesium dose rate at first, so ambient dose rates fell faster in the early years than Cs-137 decay alone would predict.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "UNSCEAR 2013 Report, Volume I, Annex A: Levels and effects of radiation exposure due to the nuclear accident after the great east-Japan earthquake and tsunami", href: "https://www.unscear.org/unscear/en/publications/2013_1.html" },
      { label: "Chino et al., Utilization of 134Cs/137Cs in the environment to identify the reactor units that caused atmospheric releases during the Fukushima Daiichi accident, Scientific Reports", href: "https://doi.org/10.1038/srep31376" },
      { label: "Yamada et al., True coincidence summing correction for cylindrical volume samples in gamma-ray spectrometry, Radioisotopes (Japan Radioisotope Association)", href: "https://jrm.jrias.or.jp/10.3769/radioisotopes.69.287/index.html" },
    ],
  },
  "Ra-226": {
    heading: "Ra-226 in legacy sources, radon and naturally occurring material",
    paragraphs: [
      "Ra-226 is the historical radionuclide: luminous paint, early brachytherapy needles and the original definition of the curie all come from it, and disused radium sources still surface in hospitals, schools and scrap. It is also the parent of radon, and radium accumulated in oil-field scale, water-treatment residues and phosphate by-products is the usual reason a material is classed as naturally occurring radioactive material (NORM).",
      "The photon table below lists the lines of Ra-226 alone, and the dose rate figures follow from them. In a sealed source that has reached equilibrium, almost all of the photon dose rate comes instead from the short-lived progeny of radon, Pb-214 and Bi-214, which this page does not include, so a radium source in equilibrium reads far higher than the figures here suggest. A freshly separated sample, or a leaking source that lets radon escape, reads lower than the same activity sealed; gamma spectrometry of environmental samples waits for that equilibrium before counting.",
      "Nothing in the decay table happens on a human scale, so radium waste does not decay away in storage. Old sources are frequently found leaking, and the escaping radon and loose radium contamination are what a survey must look for, in addition to the external photon dose.",
      "The dial painters who shaped their brushes with their lips in the early luminous-paint industry gave radiation protection its first body-burden limits, and their medical follow-up remains one of the principal human data sets on internally deposited alpha emitters. Radium-painted aircraft instruments and clock faces still contain measurable radium and fill a closed drawer or display case with radon.",
      "Two traps sit in gamma spectrometry. The radium line itself almost coincides with a line of U-235, so in uranium-bearing samples the peak cannot be assigned to radium without a uranium correction, and laboratories usually rely on the progeny lines instead. Those progeny lines are valid only after the sample has been sealed in a gas-tight container for three to four weeks, long enough for radon and its daughters to come back into equilibrium.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Radium", href: "https://www.epa.gov/radiation/radionuclide-basics-radium" },
      { label: "WHO, Radon and health (fact sheet)", href: "https://www.who.int/news-room/fact-sheets/detail/radon-and-health" },
      { label: "US EPA, Technologically Enhanced Naturally Occurring Radioactive Materials (TENORM)", href: "https://www.epa.gov/radiation/technologically-enhanced-naturally-occurring-radioactive-materials-tenorm" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
    ],
  },
  "K-40": {
    heading: "K-40 as the natural background in bodies, foods and spectra",
    paragraphs: [
      "K-40 is the primordial isotope of potassium and the largest contributor to the dose a person receives from the natural radionuclides taken in with food, because potassium is an essential element whose body content is regulated and cannot be reduced. It is present in every food that contains potassium, in fertiliser, in building materials and in soil, and its photon line is the peak found in every gamma spectrum that has been counted for long enough.",
      "The decay branches between beta emission and electron capture, with the photon coming from the capture branch, so the photon accompanies only about one decay in ten and the figures table shows a dose rate lower than the energy of the line alone would suggest. Its half-life is comparable with the age of the Earth, as the decay table makes plain, so the natural abundance is slowly falling and nothing in a human time frame changes it.",
      "In low-level counting K-40 is a floor that cannot be shielded away if the sample itself contains potassium, and in environmental surveys it is subtracted as background. The peak is also a convenient energy and resolution check for a spectrometer, since it is always present.",
    ],
  },
  "H-3": {
    heading: "Tritium in luminous devices, heavy-water reactors and tracer work",
    paragraphs: [
      "Tritium, H-3, is the hydrogen isotope with the softest beta of any nuclide on this site. It lights emergency exit signs and watch dials as gaseous tritium light sources, labels compounds in biochemistry, is produced in heavy-water-moderated reactors and is the fuel of fusion experiments. In the environment it circulates as tritiated water and follows ordinary water through soil, rivers and the body.",
      "The beta is too weak to register on a Geiger–Müller probe or to leave a glove, so contamination is found by swipes counted in liquid scintillation, and airborne tritium by flow-through ionisation chambers or by bubbling air through water. As tritiated water it exchanges freely with body water, so protection is about intake and the dose is estimated from urine samples rather than from an external meter.",
      "Tritium permeates many materials, including some metals and most plastics, which complicates containment and the design of sealed sources. The decay table below is what makes storage over several decades a real option for tritiated waste; the range table shows a stopping thickness so small that shielding is never the question.",
      "The chemical form changes the hazard far more than the activity does. Tritium gas, the form sealed inside light sources, is mostly breathed out again, whereas tritiated water is absorbed through the lungs, the gut and even intact skin; the dose coefficients for the two forms differ by roughly four orders of magnitude. Gas released from a broken light source converts slowly to water vapour, so a room where one has broken is ventilated before routine work resumes. Tritium bound into organic molecules stays in the body longer than tritiated water and is assessed separately when food and vegetation are monitored. A broken exit sign is reportable to the regulator in some jurisdictions, and intact units at the end of their life go back to the supplier.",
    ],
  },
  "F-18": {
    heading: "F-18 as the working nuclide of positron emission tomography",
    paragraphs: [
      "F-18 is the radionuclide of most positron emission tomography (PET) studies, usually as fluorodeoxyglucose. It is produced in a cyclotron, incorporated into the tracer within hours and administered the same day; the decay table below shows why delivery schedules, patient throughput and staff rotas in a PET department are all built around its half-life.",
      "Almost every decay ends in two annihilation photons emitted in opposite directions, which is what the scanner detects and also what makes a dosed patient a penetrating source. The shielding table reflects photons harder than those of most diagnostic nuclides: syringe shields are thick tungsten rather than thin lead, and the extremity dose to the technologist drawing the dose is the limiting quantity in many departments.",
      "Waste decays to background overnight, so the handling problem is short-term external dose rather than disposal. The metre dose rate in the figures table is for a bare source; the rules for staff near a freshly injected patient start from it but use a lower figure, because the patient's own body absorbs part of the annihilation radiation.",
      "The nuclide is made by proton bombardment of water enriched in O-18, and most departments receive it from a regional cyclotron rather than producing it on site. The activity ordered therefore includes the decay expected in transit, and a late delivery reduces the number of patients who can be scanned that day.",
      "Among PET nuclides F-18 emits a positron of low energy, which travels only a short distance in tissue before it annihilates; that is part of why F-18 images are sharper than those made with Ga-68 or Rb-82. The penetrating annihilation photons are the price. Facility shielding is often designed with the method of the AAPM task group report on PET and PET/CT, and the uptake rooms where patients rest after injection often set the requirement, because that is where the patient sits with the most activity. Contamination is a lesser problem than with longer-lived tracers: a small spill can often be covered, cordoned off and left to decay for a day, which exposes fewer people than an immediate clean-up.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
      { label: "Madsen et al., AAPM Task Group 108: PET and PET/CT shielding requirements, Medical Physics 33 (2006)" },
    ],
  },
  "Tc-99m": {
    heading: "Tc-99m from the generator to the gamma camera",
    paragraphs: [
      "Tc-99m is the most widely used diagnostic radionuclide. It is eluted on site from a generator loaded with its parent Mo-99, bound to one of many kit preparations, and imaged with a gamma camera whose collimators and crystals are designed around its one gamma line. The decay table below shows a half-life long enough to prepare, inject and image, and short enough to keep the patient's dose low.",
      "Quality control of the eluate includes a check for Mo-99 breakthrough, because the parent emits harder photons and would both degrade the image and add dose. The daughter of Tc-99m is the long-lived Tc-99, present in every used vial and in patient excreta, but at an activity so small that it is a disposal accounting matter rather than a dose question.",
      "Radiopharmacy shielding is lead glass and thin lead, consistent with the half-value layer on this page, and departmental waste is held for decay for a few days. Flood-source uniformity tests for the camera are done with Co-57, whose photon is close to this one and whose half-life is long.",
      "Each kit preparation is checked for radiochemical purity before it leaves the radiopharmacy, because two impurities go to the wrong organs: free pertechnetate collects in the thyroid, stomach and salivary glands, and reduced, hydrolysed technetium is taken up by the liver and spleen as a colloid. Thin-layer chromatography with two solvents separates the three forms in minutes, and an unexpected uptake pattern on a scan is often traced back to a kit that would have failed this test.",
      "Patient doses are drawn up behind lead-glass syringe shields, yet the finger doses of the staff who prepare and inject them are typically the highest personal doses in a nuclear medicine department, and ring dosimeters on the hand that holds the syringe are how they are followed. At this photon energy a lead apron still removes an appreciable share of the body dose of a technologist positioning an injected patient, which is not true of the annihilation photons in a PET suite.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
    ],
  },
  "I-125": {
    heading: "I-125 in brachytherapy seeds and in vitro assays",
    paragraphs: [
      "I-125 decays by electron capture to stable Te-125, and apart from neutrinos its emissions are soft photons and electrons of very short range. Only the photons, mostly tellurium X-rays, carry any distance. That softness is why it is used in permanent prostate brachytherapy seeds, where the dose falls off within centimetres of the implant and the patient is not a significant external source, and why it was for decades the label of choice in radioimmunoassay, where the photons are counted efficiently in a well detector.",
      "The same softness means that thin lead stops it, that a Geiger–Müller probe with a thick window misses it, and that a thin-window sodium iodide scintillator is the right survey instrument. In a well counter two photons from one decay are often absorbed together, forming a sum peak at about double the X-ray energy; its share of the counts shifts with sample height and surrounding absorber, so samples and standards are counted in matching tubes and volumes. Like other iodine isotopes it concentrates in the thyroid, so laboratory workers who iodinate proteins are monitored by thyroid counting, and the volatility of iodine means the iodination itself is done in a fume cupboard.",
      "Production is mainly by reactor irradiation of xenon gas: Xe-124 captures a neutron and the Xe-125 formed decays to I-125. The iodine itself captures neutrons readily, forming I-126 with far harder gamma rays, so enriched Xe-124 is irradiated only briefly, or the product is held while the shorter-lived I-126 decays. Stock solutions are kept alkaline, since acidified iodide releases volatile iodine.",
      "Seed output is stated as air-kerma strength in North America and reference air-kerma rate elsewhere; NIST realises air-kerma strength with a free-air chamber. The US standard was revised after soft titanium X-rays from the capsule, which barely penetrate tissue, were found to inflate the reading; aluminium foil now removes them before measurement. Silver-cored seeds add silver X-rays, so corrections differ between designs.",
      "I-125's half-life of a couple of months, as the decay table shows, suits the dose profile of a permanent implant and lets assay waste decay in storage within a year or two. The shielding figures here are among the smallest on the site and should be read in that light: lead foil or a steel container wall suffices, and for unsealed iodine, volatility and contamination outweigh dose rate.",
    ],
    sources: [
      { label: "LNHB / DDEP, Recommended nuclear data tables: I-125", href: "https://www.lnhb.fr/nuclides/I-125_tables.pdf" },
      { label: "IAEA-TECDOC-1340, Manual for Reactor Produced Radioisotopes (Iodine-125 production)", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/te_1340_web.pdf" },
      { label: "Seltzer et al. (NIST), New National Air-Kerma-Strength Standards for 125I and 103Pd Brachytherapy Seeds, J. Res. Natl. Inst. Stand. Technol.", href: "https://nvlpubs.nist.gov/nistpubs/jres/108/5/j85sel1.pdf" },
      { label: "Hunter et al., Potential Errors in the Radioassay of 125I, Journal of Nuclear Medicine", href: "https://jnm.snmjournals.org/content/16/10/952.full.pdf" },
    ],
  },
  "Se-75": {
    heading: "Se-75 for radiography of thinner steel sections",
    paragraphs: [
      "Se-75 is the alternative to Ir-192 in industrial radiography when the steel is thinner or the geometry is confined. Its photon spectrum, listed below, is softer than that of Ir-192, which gives better contrast on thin sections and allows a smaller projector shield for the same activity, and because it decays more slowly, as a comparison of the two decay tables shows, a source is exchanged less often.",
      "The source is produced by neutron activation of enriched selenium, and the chemistry of selenium, which is volatile at elevated temperature, is a constraint on source fabrication and on what happens to a source in a fire. In the field the handling rules are those of radiography generally: a high-activity source moved remotely, with the controlled area set from the dose rate at a metre in the figures table.",
      "The shielding table here is representative of the whole spectrum, and the tenth-value layer in lead is the figure that sizes a transport container. Because the photons are softer than those of Ir-192, scatter from the object under inspection can make up a larger share of the dose at the operator's position than the narrow-beam figures suggest.",
      "Its half-life is roughly one and a half times that of Ir-192, so a company running Se-75 changes sources less often, at the price of a lower output from a source of the same size. The choice between the two nuclides usually follows the wall thickness and access of the job in hand.",
      "Selenium has a medical history too. Selenomethionine labelled with Se-75 was once used to image the pancreas, and a taurine-conjugated bile acid analogue labelled with it is still used in some countries to test for bile acid malabsorption: the patient swallows a capsule and the retained fraction is measured with a gamma camera a week later, a test that depends on the long half-life.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
    ],
  },
  "Cf-252": {
    heading: "Cf-252 as a neutron source beyond the figures on this page",
    paragraphs: [
      "Cf-252 decays mainly by alpha emission, but a small branch undergoes spontaneous fission, and each fission releases several neutrons. That makes it the compact neutron source of choice for reactor start-up, for neutron radiography and activation analysis, for prompt-gamma analysis of bulk materials such as cement and coal, and for calibrating neutron instruments. A source stays useful for a few years, as the decay table below shows.",
      "This page shows no photon line and no dose rate, because the dataset records the alpha decay and not the prompt gammas of fission or the neutrons. The neutron field is the dominant external hazard, and nothing in the figures or the limits section describes it. Neutron shielding is a different problem: hydrogenous material to slow the neutrons, a boron or lithium absorber to capture them, and then lead for the capture gammas.",
      "Measurement around a Cf-252 source needs a neutron rem meter or an equivalent instrument; a photon dose rate meter reads a small fraction of the total. The fission fragments and the alpha stay inside the capsule, so intake is a concern only for a breached source.",
      "Calibration laboratories use Cf-252 as a reference neutron field, both bare and inside a heavy-water-moderated sphere that softens the spectrum, and the international standard on reference neutron radiations describes both arrangements. Its spectrum resembles the fission spectrum around reactors and spent fuel, so a calibration against it transfers reasonably well to those workplaces and less well to the softer fields behind thick shielding. A source certificate states the neutron emission rate on a reference date, and every later measurement depends on correcting that figure for decay. Older sources also contain Cf-250 and other californium isotopes made alongside Cf-252, so they lose output more slowly than the Cf-252 half-life alone predicts; a source in service for many years is checked by recalibration rather than by calculation.",
    ],
  },
  "Ac-227": {
    heading: "Ac-227 as the head of the actinium series and a generator parent",
    paragraphs: [
      "Ac-227 belongs to the actinium series, the decay chain that begins with U-235, and it is the longest-lived member between Pa-231 and the radium isotope that ends the slow part of the chain. It accumulates wherever uranium has been processed: in mill tailings, in the residues of old radium plants and in aged uranium concentrates. It also has a deliberate use. An Ac-227 source in equilibrium with Th-227 feeds a generator from which Ra-223 is milked for bone-seeking alpha therapy, so a few hospitals and radiopharmacies now hold it in quantities that would have been unthinkable a generation ago.",
      "The figures on this page describe the parent alone and understate the source badly. Its own beta is among the softest on the site, barely leaving the source, and the alpha branch is a small fraction of decays. Within weeks a sealed Ac-227 source is in equilibrium with a string of alpha, beta and gamma emitters, and almost all of the external dose rate and nearly all of the energy per decay come from those progeny rather than from the entry on this page.",
      "For protection the decisive fact is intake: actinium and its daughters deposit on bone, and the alpha energy delivered there per becquerel is high. Contamination is found by alpha and beta probes once equilibrium has set in, and gamma spectrometry identifies the chain through the daughters' lines, not through Ac-227 itself.",
    ],
  },
  "Am-243": {
    heading: "Am-243 in spent fuel and mixed-oxide handling",
    paragraphs: [
      "Am-243 is formed in reactor fuel by successive neutron captures on plutonium, and it becomes significant only in fuel that has reached high burn-up or has been recycled. Its half-life is long enough, as the decay table shows, that it sits with Pu-239 and Np-237 among the nuclides that decide the long-term radiotoxicity of spent fuel, and it is the parent of Np-239, whose gamma lines are the practical signature of fresh americium in a glovebox or a waste drum.",
      "The dataset this page draws on records no photon line for Am-243 above its cutoff, so the sheet shows the alpha lines alone and no dose rate. In practice the nuclide is identified through a low-energy gamma that it emits in most decays and through the harder lines of the Np-239 daughter once equilibrium is reached within a couple of weeks. A dose rate meter near a bulk sample is responding to that daughter and to the X-rays, not to the alpha.",
      "Handling is governed by intake. The alpha energy per decay is high and americium is retained in bone and liver, so americium work is glovebox work. The limits section says the same thing from the other side: external dose is rarely the controlling quantity for this nuclide.",
    ],
  },
  "Cf-249": {
    heading: "Cf-249 as a laboratory actinide and a long-lived californium isotope",
    paragraphs: [
      "Cf-249 is the longest-lived californium isotope in common laboratory use, produced in high-flux reactors by the slow build-up of mass along the curium and berkelium chain, and separated in milligram quantities at only a few sites in the world. It is a target material for heavy-element research and a reference material for actinide chemistry rather than a sealed-source nuclide, and almost nobody outside such a laboratory will meet it.",
      "This page lists its alpha lines but no photon line, because the dataset behind it carries none for this nuclide above the cutoff. That is a limitation of the data, not of the nuclide: Cf-249 emits a gamma line in a large fraction of decays that makes it one of the easier actinides to see in a spectrum, and a handling plan for a real sample has to include that external component, which the figures on this page cannot supply.",
      "With a half-life of centuries, as the decay table shows, it does not decay away during any experiment, and its daughter Cm-245 is itself long-lived. Contamination control follows the general actinide pattern of containment, alpha monitoring and intake limits.",
    ],
  },
  "Cm-242": {
    heading: "Cm-242 as the short-lived heat and neutron source in fresh fuel",
    paragraphs: [
      "Cm-242 is produced in reactor fuel from Am-241 by neutron capture and beta decay, and because its half-life is only months, as the decay table shows, it is the curium isotope that dominates the heat and neutron output of freshly discharged fuel and then fades within a few years, leaving Cm-244 behind. It decays by alpha emission to Pu-238, so a fuel's Pu-238 content grows for a while after discharge.",
      "Its alpha energy is high and its spontaneous-fission branch, though small, produces neutrons at a rate that matters in fuel handling and in the design of transport casks for fuel that has cooled only briefly. The page shows no photon table because the dataset records no line above the cutoff; the gamma emission is indeed weak, and the external hazard from a curium-bearing sample is set by neutrons and by fission-product gammas rather than by curium.",
      "The intake hazard is large per becquerel but short-lived in the material: a sample that is a curium problem today is a plutonium problem in a decade. Monitoring is by alpha spectrometry and neutron counting.",
    ],
  },
  "Cm-243": {
    heading: "Cm-243 as a curium isotope with a visible gamma signature",
    paragraphs: [
      "Cm-243 is a minor curium isotope in irradiated fuel, formed by neutron capture on Cm-242 and decaying mostly by alpha emission with a small electron-capture branch. Its half-life of decades places it between the short-lived Cm-242 and the long-lived heavier isotopes, and it helps keep the alpha activity of spent fuel high during the first century of storage.",
      "Unlike most of its neighbours it emits gamma lines of moderate energy in a sizeable fraction of decays, which makes it identifiable by gamma spectrometry without chemical separation. The dataset behind this page records none of those lines, so the sheet shows alpha lines only; a real Cm-243 sample therefore has an external photon component that the figures here do not represent.",
      "For protection the controlling route is intake, as for all curium, and the long-lived daughter Pu-239 means that the activity does not simply disappear with the parent. The decay table gives the pace of that transition.",
    ],
  },
  "Cm-244": {
    heading: "Cm-244 as the main neutron emitter in cooled spent fuel",
    paragraphs: [
      "Cm-244 is the curium isotope that matters most in the fuel cycle. It is built up by successive captures on plutonium and americium, so its inventory rises steeply with burn-up, and its spontaneous-fission neutrons dominate the neutron emission of spent fuel after the short-lived Cm-242 has decayed. Neutron shielding of casks and hot cells is sized for it, and a passive neutron count on reprocessing hulls, which retain traces of irradiated fuel, is mostly a count of Cm-244.",
      "Safeguards inspection exploits that steep rise: an assembly's total neutron output grows roughly as a high power of burn-up, so a neutron count can test a declared burn-up once the cooling time is known, curium decay having lowered the signal since discharge. Fuel of lower initial enrichment reaches a given burn-up with more neutron fluence and emits more. Plutonium cannot be assayed directly this way: the curium emits many times more neutrons.",
      "A soft line dominates the short photon list here, so the lead half-value layer is correspondingly tiny, and those figures cover photons alone. The leading line is weak because its transition is almost always internally converted, while the plutonium L X-rays, which the table leaves out, far outnumber every listed photon. A gram quantity of Cm-244 is a strong neutron source, yet no table here gives its neutron output. It is also a heat source, which is why NASA studies once assessed it for radioisotope power. Cm-244 sources in the X-ray spectrometers of NASA's Mars rovers, from Sojourner to Curiosity, excite rock surfaces with their alphas and X-rays.",
      "Laboratories determine Cm-244 by alpha spectrometry after separation. Curium follows americium through the column chemistry, so an Am-243 tracer monitors the yield, or Am-241 where the sample may hold Am-243. Th-227 and Ac-225, whose alphas fall in the same window, are removed chemically before a thin fluoride microprecipitate is counted. Cm-243 cannot be removed that way and sits under the same peak, so results are reported as Cm-243/Cm-244; its weaker alpha lines above that peak, or its gamma lines, can signal its presence. Curium in insoluble particles is missed unless fully dissolved.",
      "Curium-driven neutron output in storage halves in a little under two decades, well within a working career, while the plutonium daughter, Pu-240, remains. Like plutonium and americium, curium has some of the strictest intake limits.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "Reilly, Ensslin and Smith (eds), Passive Nondestructive Assay of Nuclear Materials, NUREG/CR-5550, Los Alamos National Laboratory", href: "https://mcnp-green.lanl.gov/pdf_files/TechReport_1991_LANL_LA-UR-90-0732_ReillyEnsslinEtAl.pdf" },
      { label: "US EPA, Rapid Radiochemical Method for Curium-244 in Water Samples (EPA 402-S17-001)", href: "https://www.epa.gov/sites/default/files/2017-07/documents/rapid_method_for_cm-244_in_water.pdf" },
      { label: "NASA Planetary Data System, Alpha Particle X-ray Spectrometer for MSL, instrument description", href: "https://arcnav.psi.edu/urn:nasa:pds:context:instrument:apxs.msl" },
    ],
  },
  "Cm-245": {
    heading: "Cm-245 as a long-lived fissile actinide in recycled fuel",
    paragraphs: [
      "Cm-245 is a fissile isotope, which gives it a role in criticality assessment of recycled fuel and of high-burn-up waste that the other curium isotopes do not have. It forms from Cm-244 by neutron capture and decays by alpha emission to Pu-241, so over time it feeds the Pu-241 to Am-241 route that raises the gamma dose rate of aged plutonium.",
      "With a half-life of millennia, as the decay table shows, it is one of the nuclides that remain after the shorter-lived curium has gone, and it appears in long-term inventories of geological disposal alongside Am-243 and Np-237. No photon line is on record here for Cm-245; in practice it emits a gamma line of modest energy in a fraction of decays, which gamma spectrometry of separated curium can use.",
      "Protection follows the actinide pattern: external dose is rarely limiting, intake is, and alpha spectrometry after chemical separation is the measurement of record. Mass spectrometry is preferred for isotopic ratios because the curium alpha energies are close to one another.",
    ],
  },
  "Cm-246": {
    heading: "Cm-246 as a heavy curium isotope reached only at high burn-up",
    paragraphs: [
      "Cm-246 forms only after a long chain of neutron captures and is present in appreciable amounts only in fuel that has seen very high burn-up or repeated recycling. Its half-life of a few thousand years, in the decay table, makes it a permanent member of the long-term waste inventory once formed, and its spontaneous-fission branch, though small, is large enough to contribute neutrons to such fuel.",
      "Few people will ever handle a separated Cm-246 sample. Where it is met, it is as one line in an alpha spectrum of a curium fraction, close to the lines of its neighbours, and mass spectrometry is used to resolve the isotopic composition. The page shows alpha lines only; the nuclide's gamma emission is negligible and the dataset records none, which in this case reflects the physics rather than a gap.",
      "The decay product is Pu-242, itself long-lived, so the activity is passed on rather than lost. Handling and intake limits are those of curium generally.",
    ],
  },
  "Gd-148": {
    heading: "Gd-148 as a pure alpha emitter among the lanthanides",
    paragraphs: [
      "Gd-148 is unusual: a lanthanide that decays by alpha emission to a stable daughter, with no beta, no gamma and a half-life of decades. It does not occur in nature and is produced in accelerator targets, notably in spallation targets of tungsten, tantalum or lead, where it accounts for much of the long-term alpha activity of the target material. It has been proposed as a compact heat source for the same reason.",
      "This page accordingly shows one alpha line and nothing else, and that is the complete picture rather than a dataset gap. With nothing to detect from outside, Gd-148 is measured by alpha spectrometry after chemical separation of the gadolinium fraction, and nuclides like it are what make accelerator target characterisation harder than reactor waste characterisation.",
      "The protection consequence is intake: alpha energy delivered to bone surface and liver, with a dose coefficient comparable to the actinides. Externally a Gd-148 source is silent, and the decay table shows that its activity halves within a human lifetime.",
    ],
  },
  "Np-237": {
    heading: "Np-237 as the dominant actinide in the far future of a repository",
    paragraphs: [
      "Np-237 is formed in reactor fuel from U-237 and from the decay of Am-241, and its half-life of millions of years, in the decay table, makes it the actinide that dominates calculated doses from a geological repository in the far future, when the plutonium and americium have decayed and neptunium is comparatively mobile in groundwater. It is also the target material from which Pu-238 is made for space power sources.",
      "The dataset this page uses records no photon line for Np-237, so the sheet shows alpha lines only. That understates the external signature: neptunium emits a low-energy gamma and X-rays in a sizeable fraction of decays, and its daughter Pa-233, in equilibrium within months, adds lines that are the usual way to see neptunium in a spectrum.",
      "Chemically neptunium changes oxidation state readily, and that is what makes it both a disposal concern and an analytical nuisance. Protection is governed by intake, and the limits section says so; an alpha of high energy is delivered to bone and liver, where retention is long.",
    ],
  },
  "Pa-231": {
    heading: "Pa-231 as the long-lived parent in the actinium series",
    paragraphs: [
      "Pa-231 is the long-lived link of the actinium series, formed from U-235 through Th-231 and decaying by alpha emission to Ac-227. It accumulates in uranium ores over geological time and is left behind in the residues of uranium milling, where it is one of the nuclides that keep the alpha activity of tailings high long after the uranium has been removed. Its ratio to U-235 is a dating tool in geochronology.",
      "On this page the alpha lines are listed and no photon line is recorded by the dataset, although in practice Pa-231 emits several low-energy gamma lines that a high-resolution detector can use. The real external signal from a protactinium-bearing material comes from the progeny once Ac-227 and its daughters have grown in over decades.",
      "The decay table places the half-life in the tens of millennia, so there is no storage strategy for it, and the limits section is right to point to intake: protactinium is retained in bone, and the alpha energy per becquerel taken in is among the highest on the site. Separated protactinium is rare, and most exposure arises from ores, tailings and legacy processing sites.",
    ],
  },
  "Pu-238": {
    heading: "Pu-238 as the heat source of space probes and pacemakers",
    paragraphs: [
      "Made deliberately by irradiating Np-237, Pu-238 is the usual heat source of radioisotope thermoelectric generators for spacecraft. Its alpha decay releases heat at a rate per gram high enough to power deep-space probes for decades, and the same heat once powered implanted cardiac pacemakers. The neptunium is recovered from reprocessed fuel, and irradiated targets are stored until Np-238 has become Pu-238 and short-lived activity has decayed, then dissolved to separate the plutonium as oxide. In the fuel cycle Pu-238 also appears as a by-product, formed from Np-237 by neutron capture and from Cm-242 by decay, raising the heat output and alpha activity of recycled plutonium.",
      "Outside its capsule a Pu-238 heat source needs little photon shielding, as the short, soft photon table and the sub-millimetre lead half-value layer on this page show. The remaining field is mostly neutrons, from alpha reactions on oxide oxygen and light impurities and from the small spontaneous-fission branch. Oxide fuel for power sources is made with oxygen depleted in the heavier isotopes to reduce that neutron output. One plant built to press and encapsulate the oxide by the kilogram used shielded hot cells rather than the usual gloveboxes to limit worker doses; after production ended, the argon system that kept the cells inert was shut down, and in air the contamination corroded the equipment inside.",
      "The present fuel form follows from an early launch accident. Navigation-satellite generators once carried plutonium metal meant to burn up on re-entry, and when one burned up after a failed launch, the Pu-238 in global fallout nearly tripled; later surveys mapped that deposit separately from weapons-test plutonium. Heat sources were then redesigned to survive re-entry intact; today's units hold pressed ceramic oxide pellets in iridium-alloy cladding within carbon-composite impact shells, with a frit vent that releases decay helium but retains the plutonium.",
      "Decay within a lifetime is substantial but incomplete, which, with thermocouple ageing, limits a generator's useful life and rules out holding contaminated material for decay. Intake is the controlling hazard: inhaled oxide particles lodge in the lung, and plutonium reaching the blood collects in bone and liver. Bioassay therefore rests on alpha spectrometry, in which the Pu-238 peak lies well apart from Pu-239 and Pu-240 but cannot be resolved from the main Am-241 line, so americium is removed chemically before counting.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "Idaho National Laboratory for the US DOE, Atomic Power in Space II: A History (INL/EXT-15-34409)", href: "https://inldigitallibrary.inl.gov/sites/sti/sti/Sort_63995.pdf" },
      { label: "Hardy, Krey and Volchok, Global inventory and distribution of fallout plutonium, Nature", href: "https://www.nature.com/articles/241444a0" },
      { label: "Maxwell et al., Rapid determination of Np-237 and Pu isotopes in water by ICP-MS and alpha spectrometry, Journal of Radioanalytical and Nuclear Chemistry", href: "https://link.springer.com/article/10.1007/s10967-010-0825-9" },
    ],
  },
  "Pu-240": {
    heading: "Pu-240 as the isotope that defines plutonium grade",
    paragraphs: [
      "Pu-240 is formed by neutron capture on Pu-239 and its fraction grows with burn-up, which is why the Pu-240 content separates weapons-grade from reactor-grade plutonium. Its spontaneous-fission branch is a minute share of its decays yet far larger than that of Pu-239, so its neutrons dominate the coincidence signal in passive neutron assay of plutonium, and they are also one reason reactor-grade material is harder to handle in bulk. Those neutrons would start the chain reaction too early in a gun-type assembly, so plutonium weapons use implosion; reactors making weapons material also kept burn-up low to limit them. IAEA safeguards do not recognise grades: all plutonium except material that is at least four-fifths Pu-238 counts as direct-use material.",
      "The two soft photon lines and very thin half-value layer on this page match the gamma emission but not the external field of real material: in a bulk item those photons are largely absorbed within the plutonium itself, so outside it the Pu-240 contribution is mainly neutrons, which the figures here do not include. Its gamma lines at higher energy, used in isotopic analysis, are too weak to appear.",
      "Pu-238 and Pu-242 also fission spontaneously, so a coincidence counter reports an effective Pu-240 mass weighted across the even isotopes, and total plutonium then needs the isotopic composition. Alpha-particle reactions on oxygen, fluorine or other light elements add uncorrelated neutrons that raise the accidental rate, and induced fission in large items multiplies the correlated signal; multiplicity counting separates these effects. In gamma spectra the harder line listed here sits beside plutonium X-rays excited within concentrated samples, so isotopic codes often favour a weaker, higher line, itself overlapped by Pu-241 and Pu-239 peaks and paired with a nearby Pu-241 or U-237 line. In alpha spectra Pu-240 merges with Pu-239, and laboratories separate the two by mass spectrometry.",
      "Over the millennia that the decay table covers, Pu-240 remains a substantial part of the plutonium inventory, and its alpha decay feeds U-236, too long-lived to change what the source emits. Intake, not external dose, governs protection: inhaled particles lodge in the lung, and absorbed plutonium settles in bone and liver. Handling reactor-grade material in bulk adds external measures: polyethylene or water against neutrons beside a dense photon shield, and possibly more remote operation on production lines.",
    ],
    sources: [
      { label: "LNHB / DDEP, Recommended nuclear data tables (Pu-240)", href: "https://www.lnhb.fr/nuclides/Pu-240_tables.pdf" },
      { label: "D. Reilly, N. Ensslin, H. Smith Jr. (eds.), Passive Nondestructive Assay of Nuclear Materials, NUREG/CR-5550 (LA-UR-90-732), Los Alamos National Laboratory", href: "https://www.osti.gov/biblio/5428834" },
      { label: "IAEA Safeguards Glossary, 2022 Edition", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/PUB2003_web.pdf" },
      { label: "J. Carson Mark, Explosive Properties of Reactor-Grade Plutonium, Science & Global Security 4 (1993)", href: "https://scienceandglobalsecurity.org/archive/sgs04mark.pdf" },
    ],
  },
  "Pu-241": {
    heading: "Pu-241 as a beta emitter that becomes an americium problem",
    paragraphs: [
      "Pu-241 is the odd one out among the plutonium isotopes: it decays almost entirely by a very soft beta, with an alpha branch so small that it is a curiosity, and its half-life is only years. It forms by neutron capture on Pu-240 and its share in plutonium therefore rises with burn-up. Its practical importance lies in its daughter. Every decay produces an atom of Am-241, so plutonium that is stored for a decade acquires a gamma-emitting americium content that raises the dose rate at the glovebox and complicates recycling.",
      "The figures on this page show a beta endpoint among the softest on the site and no photon line, which is consistent with the physics: Pu-241 itself is almost invisible to a dose rate meter and to a gamma spectrometer, and it is measured by liquid scintillation after separation or inferred from the americium that has grown in.",
      "For intake the dose coefficient is lower than for the alpha-emitting isotopes, but a plutonium intake is never Pu-241 alone, and the americium formed inside the body after the intake adds to the committed dose.",
    ],
  },
  "Pu-242": {
    heading: "Pu-242 as a long-lived plutonium isotope and an analytical spike",
    paragraphs: [
      "Pu-242 is produced from Pu-241 by neutron capture and reaches a few per cent of the plutonium in high-burn-up fuel. Its half-life of hundreds of millennia, as the decay table shows, is long enough that it is often the plutonium isotope chosen as an isotope-dilution spike in analytical chemistry, where a known amount is added to a sample so that the other isotopes can be measured against it by mass spectrometry.",
      "The page lists its alpha lines and no photon line, which matches its weak gamma emission; the dose rate from a sample is set by the other isotopes present, chiefly the americium grown in from Pu-241. Alpha spectrometry cannot separate Pu-242 cleanly from the neighbouring isotopes because the energies are close, which is another reason mass spectrometry is the method of choice.",
      "In disposal it is one of the actinides that remain after Pu-239 has largely decayed, and its daughter U-238 is effectively stable on any practical scale. Intake remains the governing hazard.",
    ],
  },
  "Pu-244": {
    heading: "Pu-244 as the last surviving primordial plutonium",
    paragraphs: [
      "Pu-244 has a half-life of tens of millions of years, long enough that traces formed before the solar system may survive in the Earth's crust, and the search for it in natural minerals is a small but famous chapter of geochemistry. It is produced in reactors only in minute quantities, and in nuclear weapons tests, so it has no practical fuel-cycle role and appears here as the long-lived end of the plutonium series.",
      "The alpha lines on this page are its whole signature in this dataset. Its gamma emission is negligible, it has a spontaneous-fission branch, and separated samples exist only in laboratories; it has been used as a reference material for the age of the solar system and as a spike for the mass spectrometry of plutonium.",
      "Its decay product is U-240, which decays further through Np-240 to Pu-240, so a Pu-244 sample slowly acquires a second plutonium isotope. Handling is governed by intake like any plutonium, but the activity per gram is low because the half-life is so long.",
    ],
  },
  "Ra-223": {
    heading: "Ra-223 as a bone-seeking alpha therapy nuclide",
    paragraphs: [
      "Ra-223 is the nuclide of the first alpha-emitting radiopharmaceutical to reach routine clinical use, given as the chloride to treat bone metastases of prostate cancer. Radium follows calcium into bone, the alpha range is a few cell diameters, and the half-life of days, in the decay table, fits a course of injections. It is obtained from an Ac-227 generator, which is why that nuclide has entered hospital inventories.",
      "The photon table on this page is long because Ra-223 itself emits many lines; in practice the short-lived daughters that follow each decay add their own, and an administered patient is a measurable gamma source, though a modest one. The alpha lines listed are those of Ra-223 itself; a source in equilibrium carries the daughters' alphas as well, and the dose rate figures here are what a nursing plan starts from.",
      "Waste from a treatment decays to background within a few weeks, and the usual precautions concern excreta rather than external exposure. Measurement is by gamma spectrometry of the daughter lines or by alpha counting of swipes.",
    ],
  },
  "Ra-224": {
    heading: "Ra-224 as the short-lived radium of the thorium series",
    paragraphs: [
      "Ra-224 is the daughter of Th-228 in the thorium series, and it is the radium isotope whose decay releases thoron, the short-lived radon isotope of that series, from a thorium-bearing material, rather than the familiar radon of the uranium series. It was once injected as a treatment for bone disease, is still the parent of Pb-212 generators used in targeted alpha therapy research, and appears in the characterisation of thorium ores, gas mantles and welding electrodes.",
      "For Ra-224 this dataset has no photon line, and only the alpha lines appear. In practice a weak gamma line exists and, more importantly, the daughters that grow in over a day or two, especially Pb-212 and Tl-208, emit strong lines that dominate any gamma spectrum of a thorium-series sample. The external dose from such a sample is a daughter story.",
      "A half-life of days means Ra-224 cannot be stockpiled, and a Ra-224 source is in practice a Th-228 source in equilibrium. Intake governs protection, as for all radium, with the thoron progeny adding an inhalation component in enclosed spaces. In a gamma spectrum its presence is normally inferred from that Pb-212, so a freshly prepared sample has to settle for those days before the line represents the radium.",
      "Thoron itself lasts about a minute, so most of it decays within a short distance of the surface that releases it, how short depending on the air movement. Indoor readings near thorium-rich plaster, stored thorium compounds or mineral sand therefore depend strongly on where the detector stands, and some passive radon detectors also register thoron, which can push a radon result upward close to such surfaces.",
      "The historical injections of Ra-224 for ankylosing spondylitis and for bone tuberculosis were followed up for decades, and the excess of bone sarcomas among those patients is part of the evidence on which the risk of alpha emitters at bone surfaces rests. Present-day research uses the nuclide differently: in implanted seeds that release its short-lived daughters into a tumour, and in generators supplying Pb-212 for labelled antibodies and peptides.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
      { label: "US EPA, Radionuclide Basics: Radium", href: "https://www.epa.gov/radiation/radionuclide-basics-radium" },
    ],
  },
  "Ra-228": {
    heading: "Ra-228 as the beta-emitting radium of thorium ores and scale",
    paragraphs: [
      "Ra-228 is the first long-lived daughter of Th-232 and the member of the thorium series that regulators and geochemists measure to characterise thorium-bearing materials: monazite sands, oil-field scale, water-treatment residues and some fertilisers. Unlike Ra-226 it is a beta emitter, and its activity in a water sample is a marker for thorium-series input as opposed to uranium-series input.",
      "The dataset behind this page records no photon line for Ra-228, only beta branches so soft that the range table stops them in a few hundredths of a millimetre of acrylic, and the page has no photon section. That reflects the nuclide's very soft beta and negligible gamma; in practice Ra-228 is determined through its daughter Ac-228, whose strong gamma lines appear once equilibrium is reached within days, or by beta counting after chemical separation.",
      "Its half-life of a few years, in the decay table, means that a radium-bearing scale sample changes character over a decade: the Ra-228 decays while the longer-lived Ra-226 remains. The intake hazard is that of radium generally, with deposition in bone.",
      "In oil and gas production both radium isotopes co-precipitate with barium and strontium sulfate as pipe scale, and the pair works as a clock. Ra-228 decays much faster than Ra-226, so their ratio falls as the scale ages, while the Th-228 growing in from Ra-228 supplies a second ratio that rises over the first years. Together they let an operator estimate when a deposit formed, which matters when old scale in stored equipment is assessed for disposal. Because Ac-228 follows Ra-228 within days but Th-228 takes years, a gamma result from the Ac-228 lines describes Ra-228 itself, whereas one from the Pb-212 and Tl-208 lines describes Th-228 and can differ widely from it in young scale.",
      "Some drinking-water standards regulate the two radium isotopes as a combined value, and the laboratory work splits accordingly: a gamma or beta method for Ra-228 and an alpha or radon-emanation method for Ra-226. A result for one isotope on its own does not describe the radium content of the water.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Radium", href: "https://www.epa.gov/radiation/radionuclide-basics-radium" },
      { label: "US EPA, Technologically Enhanced Naturally Occurring Radioactive Materials (TENORM)", href: "https://www.epa.gov/radiation/technologically-enhanced-naturally-occurring-radioactive-materials-tenorm" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
    ],
  },
  "Sm-147": {
    heading: "Sm-147 as a primordial alpha emitter in rare-earth materials",
    paragraphs: [
      "Sm-147 is a naturally occurring alpha emitter with a half-life, shown in the decay table, far longer than the age of the Earth. It makes up a substantial fraction of natural samarium, so every samarium compound, including the samarium-cobalt magnets in motors and headphones and the samarium used in reactor control rods and neutron absorbers, carries a measurable alpha activity. The samarium-neodymium pair is a standard chronometer for dating rocks and meteorites.",
      "The page shows a single alpha line and nothing else, which is the whole physics: there is no gamma and no beta. A samarium magnet reads nothing on a dose rate meter and nothing on a gamma spectrometer; only an alpha probe on a bare surface, or a thin-source alpha count after dissolution, reveals the activity.",
      "So long a half-life means little activity per gram, and the exposure from handling samarium products is negligible in practice. The nuclide appears in waste characterisation and in NORM assessments of rare-earth processing residues, where the alpha activity of the samarium fraction has to be accounted for.",
    ],
  },
  "Th-228": {
    heading: "Th-228 as the gamma-bright member of the thorium series",
    paragraphs: [
      "Th-228 is the thorium isotope that makes thorium materials visible to a dose rate meter. It sits in the middle of the Th-232 series, grows in from Ra-228 through Ac-228, and within weeks is in equilibrium with a short chain ending in Tl-208, whose high-energy gamma line is the most penetrating photon in any natural decay series. Freshly separated thorium is quiet; thorium that has aged a few years is not.",
      "The photon table on this page lists Th-228's own lines, which are soft and few. The penetrating field around a thorium source comes from the progeny, so the lead half-value layer here applies to the parent alone and would be misleading for an aged source. Th-228 is also used as a source of Ra-224 and Pb-212 for alpha-therapy research.",
      "The half-life, in the decay table, is a couple of years, so Th-228 and its daughters decay away from a chemically purified thorium sample and then grow back from the Ra-228 that was removed with it; the dose rate of such a sample falls and rises over a decade in a way that confuses anyone who expects simple decay.",
    ],
  },
  "Th-229": {
    heading: "Th-229 as the parent of Ac-225 and a nuclear-clock candidate",
    paragraphs: [
      "Th-229 is a member of the neptunium series, formed from U-233, and it has acquired two very different modern roles. Its decay chain passes through Ac-225 and Bi-213, which are milked from Th-229 stocks for targeted alpha therapy, so the small world stock of Th-229 is a scarce medical resource. And its nucleus has an excited state so low in energy that it can be reached with ultraviolet light, which makes it the leading candidate for a nuclear clock.",
      "No photon line is recorded for Th-229 in this dataset, and the alpha lines stand alone. In practice Th-229 emits several gamma lines of modest intensity, and the chain of daughters that follows it contributes much more; a Th-229 generator is shielded for the progeny, not for the parent.",
      "Its half-life runs to millennia, so a Th-229 stock is permanent on any human scale, and the material is recovered from aged U-233 rather than made directly. Intake governs its hazard, with thorium deposited on bone surfaces.",
    ],
  },
  "Th-230": {
    heading: "Th-230 as the chronometer and the slow link of the uranium series",
    paragraphs: [
      "Th-230 is the daughter of U-234 and the parent of Ra-226, and its half-life of tens of millennia, in the decay table, makes it the bottleneck of the uranium series. Because thorium is immobile in water while uranium is soluble, the growth of Th-230 towards equilibrium with uranium is the basis of uranium-thorium dating of corals, cave deposits and bones, one of the most used chronometers for the geologically recent past.",
      "It accumulates in uranium mill tailings, where it is the long-term source of the Ra-226 and radon that make tailings a regulatory concern on a timescale beyond that of the radium itself. The dataset records no photon line above its cutoff, consistent with the nuclide's very weak gamma emission, so the page lists alpha lines alone.",
      "Measurement is by alpha spectrometry after separation of the thorium fraction, or by mass spectrometry for dating. Protection is an intake matter, with the alpha energy delivered to bone surfaces, and the limits section says as much.",
    ],
  },
  "Th-232": {
    heading: "Th-232 as the primordial head of the thorium series",
    paragraphs: [
      "Th-232 is the primordial parent of the thorium series and the most abundant actinide in the Earth's crust, several times as common as uranium. It is the fertile material of the thorium fuel cycle, breeding U-233 under neutron irradiation, and it is met in practice through its minerals and products: monazite sand, thoriated tungsten welding electrodes, old gas mantles and optical glass, and the residues of rare-earth processing.",
      "The page shows a few soft photon lines and an alpha table; the figures describe Th-232 on its own, which reads very little, although even purified thorium still carries Th-228, whose hard-gamma progeny grow back within weeks. A natural thorium material in equilibrium is a different source entirely, because the chain through Ra-228, Th-228 and Tl-208 adds beta and penetrating gamma emission, and that is what a survey meter sees on a bag of monazite.",
      "With a half-life comparable to the age of the universe, as the decay table shows, Th-232's own activity per gram is small and its hazard arises from the progeny and from intake of thorium dust, which deposits on bone surfaces and in the lung. Thoron from the chain is a concern in enclosed thorium stores.",
      "Chemical processing breaks the chain, and the activity of the product then drifts for decades. Purified thorium has lost its radium, so the Th-228 and its hard-gamma progeny decay away over the following years, pass through a minimum and then slowly grow back as fresh Ra-228 forms. Two surveys of the same drum ten years apart can therefore disagree markedly without anything having been added or removed.",
      "Thoriated tungsten electrodes show where exposure really arises: storing them is a minor matter, but grinding the tips releases fine thorium-bearing dust into the welder's breathing zone, which is why ceriated and lanthanated electrodes are offered instead. At the scale of mineral sands and rare-earth plants, the international safety standards bring a material into regulatory scope when its thorium-series activity concentration exceeds a stated level, and the national value derived from them is the one that applies.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Thorium", href: "https://www.epa.gov/radiation/radionuclide-basics-thorium" },
      { label: "US EPA, Technologically Enhanced Naturally Occurring Radioactive Materials (TENORM)", href: "https://www.epa.gov/radiation/technologically-enhanced-naturally-occurring-radioactive-materials-tenorm" },
      { label: "IAEA GSR Part 3, Radiation Protection and Safety of Radiation Sources: International Basic Safety Standards", href: "https://www.iaea.org/publications/8930/radiation-protection-and-safety-of-radiation-sources-international-basic-safety-standards" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
    ],
  },
  "U-232": {
    heading: "U-232 as the gamma problem of the thorium fuel cycle",
    paragraphs: [
      "U-232 is produced alongside U-233 in thorium fuel through side reactions, and although its concentration is small it dominates the handling of bred uranium. Its half-life is a few decades, and its decay chain is the lower part of the thorium series, ending in Tl-208 with its high-energy gamma. Separated U-233 therefore becomes a penetrating gamma source within a year or two of purification, which is both a handling burden and a proliferation barrier.",
      "The dataset records no photon line for U-232 itself, so the page shows alpha lines only; that is honest for the parent and silent about the chain, which is the whole point of this nuclide. A survey of thorium-cycle uranium is a survey of the Tl-208 line.",
      "Intake governs the direct hazard, since the alpha energy ends up on bone surfaces, and the daughters add inhalation of thoron progeny in an enclosed store. Measurement of U-232 itself is by alpha spectrometry or mass spectrometry.",
    ],
  },
  "U-233": {
    heading: "U-233 as the fissile product of the thorium cycle",
    paragraphs: [
      "U-233 is the fissile isotope bred from Th-232, and it is the reason the thorium fuel cycle exists. It has been used in experimental reactors and in a handful of weapons tests, and stocks of it are stored under safeguards. Its decay chain is the neptunium series, which passes through Th-229, so aged U-233 is the source from which Th-229 and the therapy nuclide Ac-225 are recovered.",
      "The page lists its alpha lines only; the weak gamma emission of U-233 produces no line above the dataset's cutoff. Pure U-233 reads little externally; what makes stored U-233 a gamma source is the U-232 that always accompanies it and the Tl-208 at the end of that chain, which the figures here do not describe.",
      "With a half-life of over a hundred millennia, as the decay table shows, U-233 is a permanent inventory item. It is fissile, so criticality control applies to any bulk quantity, and intake governs its radiological hazard like other uranium isotopes, with bone and kidney the organs of concern.",
    ],
  },
  "U-234": {
    heading: "U-234 as the hidden contributor to natural uranium activity",
    paragraphs: [
      "U-234 is a daughter of U-238 a few steps down the chain and a tiny fraction of natural uranium by mass, yet in undisturbed ore it carries as much activity as its parent. Enrichment concentrates it along with U-235, so enriched uranium is more radioactive per gram than natural uranium largely because of its U-234 content. Outside the natural series it is also the alpha-decay product of Pu-238, so it accumulates in any stock of Pu-238.",
      "The external field from uranium metal or oxide is dominated by the beta-emitting daughters of U-238 and, in enriched material, by the U-235 line rather than by U-234. In groundwater the ratio of U-234 to U-238 departs from equilibrium because alpha recoil drives Th-234, a short-lived precursor of U-234, out of mineral grains, or leaves it in damaged sites that water leaches more readily, and that ratio is a tracer of water-rock interaction.",
      "Gamma spectrometry is a poor way to find U-234 in environmental samples. Its main line coincides with a more intense line of Pb-214, a short-lived decay product of radon that accompanies uranium in nearly all soil and rock, while the excited level of Th-230 that many decays feed loses its energy mostly by internal conversion, and the thorium L X-rays that follow fall below the photon cutoff used here. A standard laboratory route is chemical separation with a U-232 yield tracer, electrodeposition on a stainless steel disc and alpha spectrometry. U-234 then gives the highest-energy peak of the natural uranium isotopes, but the Th-230 peaks lie just beneath it, so thorium left by an incomplete separation inflates the result, and the tracer stock needs periodic repurification as its own daughters grow in.",
      "U-234 is effectively permanent, its half-life running to a few hundred millennia. Chemical separation of uranium from ore leaves the Th-230 and radium behind, so the chain below U-234 regrows only through its decay; with Th-230 long-lived and little U-234 left in depleted uranium tails, radium and radon build up in those tails over hundreds of millennia and come close to equilibrium only after about a million years, so a long-term view of such waste has to follow the whole chain, not the uranium alone. Intake governs work with U-234, and for uranium that means a radiological dose combined with chemical toxicity to the kidney.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "LNHB / DDEP, Recommended nuclear data tables: U-234", href: "https://www.lnhb.fr/nuclides/U-234_tables.pdf" },
      { label: "US EPA, Radionuclide Basics: Uranium", href: "https://www.epa.gov/radiation/radionuclide-basics-uranium" },
      { label: "US EPA Method EMSL-33, Isotopic Determination of Plutonium, Uranium, and Thorium in Water, Soil, Air and Biological Tissue", href: "https://www.epa.gov/sites/default/files/2015-06/documents/epa-emsl-33.pdf" },
      { label: "D. Porcelli and P. W. Swarzenski, The behavior of U- and Th-series nuclides in groundwater, Reviews in Mineralogy and Geochemistry 52 (2003) 317-361" },
    ],
  },
  "U-235": {
    heading: "U-235 as the fissile isotope and the uranium signature line",
    paragraphs: [
      "U-235 is the fissile isotope of natural uranium, the one whose share is raised by enrichment for reactor fuel and lowered to the depleted uranium used in shielding and counterweights. Its share in a sample is the quantity that safeguards verification measures, and its gamma line of medium energy, emitted in a majority of its decays, is the signature used to do that non-destructively through a container wall.",
      "U-235 emits many lines, so the photon table here is long, and unlike the other uranium isotopes it carries enough photon emission to earn a dose rate section; the lead half-value layer here is small. Enrichment meters compare the strength of the main line with the mass of uranium seen in a sample, and that is where the figures on this page have a direct use.",
      "Its half-life of hundreds of millions of years, as the decay table shows, places it among the primordial nuclides. Criticality control applies to enriched material, and intake remains the radiological concern, with the chemical toxicity of uranium to the kidney often the limiting factor for soluble compounds.",
    ],
  },
  "U-236": {
    heading: "U-236 as the fingerprint of irradiated uranium",
    paragraphs: [
      "U-236 is formed when U-235 captures a neutron without fissioning, so it is present in any uranium that has been through a reactor and essentially absent from natural uranium. That makes it the fingerprint of recycled uranium: its presence above the trace natural level proves irradiation, and its ratio to U-238 is a tracer for reprocessing releases in the environment, measured by accelerator mass spectrometry at extraordinarily low levels.",
      "Only alpha lines appear on this page; the gamma emission is negligible, and U-236 is never seen by a survey meter and rarely by a spectrometer, and its radiological contribution to recycled uranium fuel is small. Its practical cost is as a neutron absorber in the reactor, which is why recycled uranium is enriched slightly higher to compensate.",
      "Its half-life is tens of millions of years, so it is permanent on any scale that matters, and its alpha decay feeds Th-232. Intake governs protection as for all uranium isotopes.",
      "Measuring it is a problem of separation rather than sensitivity. In an alpha spectrum its peak falls among the higher U-235 lines, below U-234, and sits on their tails, so routine alpha spectrometry seldom reports more than an upper limit unless the sample is rich in it. Thermal ionisation and inductively coupled plasma mass spectrometry resolve it in fuel and reprocessed material, where the tails of the U-235 and U-238 peaks and, in plasma instruments, the hydride ion formed from U-235 are the interferences to correct; environmental levels need accelerator mass spectrometry, which removes molecular ions altogether.",
      "Reprocessed uranium carries a second tell-tale isotope, U-232, whose short-lived descendants include Tl-208 with a very hard gamma line. That, and not U-236, is what raises the dose rate around recycled uranium as it ages, so the missing shielding section on this page is accurate for U-236 alone and silent about the material it usually travels in.",
      "Because the ratio of U-236 to U-238 in seawater records both weapons fallout and the discharges of European reprocessing plants, oceanographers use it to follow water masses through the North Atlantic and into the Arctic.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
      { label: "US EPA, Radionuclide Basics: Uranium", href: "https://www.epa.gov/radiation/radionuclide-basics-uranium" },
      { label: "P. Steier et al., Natural and anthropogenic U-236 in environmental samples, Nuclear Instruments and Methods in Physics Research B 266 (2008)" },
    ],
  },
  "U-238": {
    heading: "U-238 as the bulk of uranium and the head of its series",
    paragraphs: [
      "U-238 is almost all of natural uranium by mass, the fertile isotope that breeds Pu-239 in reactors, and the head of the uranium series that ends in Pb-206 by way of Ra-226 and radon. Depleted uranium, the leftover of enrichment, is nearly pure U-238 and is used for shielding, counterweights and penetrators. Its half-life, in the decay table, is of the same order as the age of the Earth, which is what makes uranium-lead dating possible.",
      "The photon lines on this page are few and soft, and a bare piece of U-238 metal reads chiefly through the beta emission of its first daughters, Th-234 and Pa-234m, which reach equilibrium within months and are not represented here. The figures therefore describe freshly separated U-238 and understate aged metal.",
      "Intake governs the radiological hazard, and for soluble forms the kidney's chemical sensitivity to uranium is often the limiting factor. Radon from the chain is the dominant public exposure in many regions, but it is a product of the Ra-226 far down the chain rather than of U-238 itself. Industrial residues often break the chain at that point: in phosphate processing, for example, uranium follows the acid while radium stays with the gypsum, so each stream has to be characterised separately.",
      "Depleted uranium is denser than lead, and that, rather than any radiological property, is why it forms the shield inside many gamma radiography projectors and some transport packages: the same attenuation fits into a smaller, lighter body. Such shields are radioactive items in their own right, with their own surveys and disposal route. Where depleted uranium munitions have been used, post-conflict environmental assessments have concentrated on chemical toxicity and on dust from impacts rather than on external dose.",
      "Gamma spectrometry never measures U-238 by its own lines. The usual indicators are Th-234, whose soft line sits in a crowded region of the spectrum, and Pa-234m, whose weak but clean high-energy line is free of interference. Both assume that the first daughters have had several months since the uranium was last chemically processed.",
    ],
    sources: [
      { label: "US EPA, Radionuclide Basics: Uranium", href: "https://www.epa.gov/radiation/radionuclide-basics-uranium" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
    ],
  },
  "Pb-210": {
    heading: "Pb-210 as the long-lived marker within the radon decay chain",
    paragraphs: [
      "Pb-210 is the long-lived nuclide that the uranium series leaves behind after radon, and it decays over decades through Bi-210 to Po-210. Radon in the air passes through a few short-lived steps to Pb-210, which settles onto soil, sediments and snow, while radon carried in natural gas leaves it inside pipes. Steady atmospheric deposition makes it the standard chronometer for recent sediments, and its build-up in oil and gas equipment is a recognised NORM problem.",
      "The single soft photon line on the page, the very soft beta and the thin half-value layer all make Pb-210 hard to detect; it is measured through its soft gamma with a thin-window detector, by beta counting of the Bi-210 daughter after ingrowth, or by alpha counting of the Po-210 that follows. The figures understate a source in equilibrium, whose energetic Bi-210 beta and Po-210 alpha carry most of the emitted energy.",
      "That gamma is weak because the excited bismuth level mostly de-excites by internal conversion, releasing electrons and soft bismuth X-rays instead; a vanishingly rare alpha branch to Hg-206 also exists. The photon is further absorbed within the sample, so a dense scale reads lower than a light sediment of equal activity. For gamma counting, samples are often packed in flat containers on thin-window n-type germanium, and each can be corrected for self-absorption by how strongly it attenuates a Pb-210 source laid over it. Sediment dates rest on the unsupported fraction, the Pb-210 in excess of what radium in the same layer sustains.",
      "Intake is the concern rather than external dose, with lead retained in bone and the polonium daughter formed inside the body; tobacco smoke delivers Pb-210 and Po-210 to the lung by inhalation. In gas plant the film sits behind steel that stops both beta and photon, so a survey instrument on a closed line shows nothing and the deposit is found only when equipment is opened. Melting contaminated scrap leaves most NORM in the slag but sends volatile Pb-210 and Po-210 into furnace dust and fume. Because Pb-210 has a half-life of more than two decades, storage for decay rarely clears a deposit.",
      "Lead shielding carries the nuclide too: refined lead retains Pb-210, whose Bi-210 bremsstrahlung raises the background of low-level counters, so some rare-event experiments use lead from Roman ingots raised from the sea, whose Pb-210 has long since decayed.",
    ],
    sources: [
      { label: "LNHB / DDEP, Recommended nuclear data tables: Pb-210", href: "https://www.lnhb.fr/nuclides/Pb-210_tables.pdf" },
      { label: "IAEA Safety Reports Series No. 34, Radiation Protection and the Management of Radioactive Waste in the Oil and Gas Industry", href: "https://www-pub.iaea.org/mtcd/publications/PDF/Pub1171_web.pdf" },
      { label: "Pattavina et al., Radiopurity of an archaeological Roman lead cryogenic detector, European Physical Journal A", href: "https://doi.org/10.1140/epja/i2019-12809-0" },
      { label: "Appleby and Oldfield, The calculation of lead-210 dates assuming a constant rate of supply of unsupported Pb-210 to the sediment, Catena (1978)", href: "https://doi.org/10.1016/S0341-8162(78)80002-2" },
    ],
  },
  "Bi-210": {
    heading: "Bi-210 as the energetic beta step before polonium",
    paragraphs: [
      "Bi-210 is the beta-emitting daughter of Pb-210 and the parent of Po-210, and in any material that carries Pb-210 it is in equilibrium within weeks, since its own half-life is only days. Its beta is energetic, in contrast to the very soft beta of its parent, and that is what beta counting of a sample that carries Pb-210 actually detects after the bismuth has grown in.",
      "The page lists a beta endpoint and range figures and no photon line, which is the complete picture: Bi-210 has no useful gamma. Its range in the absorber table reaches several millimetres in light materials, enough to make a bare source a skin-dose consideration, and the bremsstrahlung fraction in lead is the reason a low-atomic-number shield is placed first.",
      "Separated Bi-210 is rarely handled on its own; it matters as a link that converts the lead problem into the polonium problem, and in the analytical chemistry of the radon chain, where the ingrowth time before counting is set by this half-life.",
    ],
  },
  "Ar-39": {
    heading: "Ar-39 in groundwater dating and in liquid-argon detectors",
    paragraphs: [
      "Ar-39 is made in the upper atmosphere by cosmic rays acting on argon, and because it is a noble gas it dissolves in rain and travels with groundwater without reacting with anything. Its half-life of a few centuries fills the gap between tritium and C-14 as a dating tool, and Ar-39 measurements set the age of groundwater, ocean deep water and glacier ice on the scale of human history. In reactors it is produced from potassium in concrete and from the argon in air, which is why it appears in decommissioning inventories.",
      "It matters in a quite different field as well. Argon distilled from the atmosphere carries a trace of Ar-39, and in large liquid-argon detectors built to search for dark matter that trace is the dominant background; argon extracted from deep underground wells, which has been shielded from cosmic rays for ages, is used instead.",
      "The page shows a beta endpoint and range figures only, which is the whole emission. There is no photon, so counting is done in gas proportional counters or by atom-trap methods that detect single atoms, and a sealed sample is externally silent.",
    ],
  },
  "Ca-41": {
    heading: "Ca-41 as a hidden long-lived activation product of concrete",
    paragraphs: [
      "Ca-41 is produced when the stable calcium in concrete captures a neutron, so the biological shield of every power reactor contains it after decades of operation. Its half-life runs to tens of millennia, and it emits nothing above the cutoff of this dataset: no gamma, no beta, only soft X-rays and Auger electrons. It is therefore the archetype of the hard-to-measure nuclide in decommissioning, present in large volumes of concrete that will be disposed of or cleared, and invisible to any survey instrument.",
      "The figures table on this page carries the half-life and specific activity and nothing else, and that absence is accurate rather than a gap. Characterisation relies on sampling followed by chemical separation and liquid scintillation counting of the X-rays, or on accelerator mass spectrometry, with scaling factors to the measurable Eu-152 and Co-60 in the same concrete.",
      "Outside the nuclear industry Ca-41 is a cosmogenic tracer, formed in rock exposed at the surface, and it has been explored for dating bone on timescales where C-14 has run out. Its radiological hazard is slight: a weak emitter that follows calcium into bone, with a dose coefficient among the lowest on the site.",
    ],
  },
  "Ca-45": {
    heading: "Ca-45 as a bone and soil tracer with a soft beta",
    paragraphs: [
      "Ca-45 is the working isotope for tracing calcium: in bone physiology, in the uptake of calcium by plants and in the movement of calcium through soils and water-treatment processes. It is made by neutron irradiation of calcium enriched in the heavier isotope, and its half-life of months, shown in the decay table, allows an experiment to run for a season without the label decaying away.",
      "It is a pure beta emitter, and the page accordingly shows an endpoint, a range table and bremsstrahlung fractions but no photon section. The beta is soft enough that a glove and the wall of a vial stop it, so external dose is rarely a concern, and detection is by liquid scintillation counting of samples rather than by survey meter.",
      "In reactor steel and concrete Ca-45 forms by activation as well, but with a half-life of months it has decayed long before decommissioning, and it does not appear in long-term inventories. The intake pathway is deposition in bone, as for any calcium isotope.",
    ],
  },
  "Cd-109": {
    heading: "Cd-109 as a soft X-ray source for fluorescence analysis and gauging",
    paragraphs: [
      "Cd-109 decays by electron capture to a short-lived state of silver, and almost all the photons it emits are silver X-rays, with a modest gamma line above them. That spectrum made it a widely used excitation source of portable X-ray fluorescence analysers: the silver X-rays excite the K lines of elements from the transition metals up to around molybdenum and the L lines of heavy elements such as lead, so a Cd-109 analyser identifies alloys, lead in paint and metals in soil. It also serves as a low-energy calibration standard for spectrometers and has been used in coating and paint thickness gauges. Neutron capture on Cd-108 in a reactor or proton bombardment of silver produces it, and only the reactor route risks an Ag-110m impurity.",
      "Lines so soft dominate this page's photon table that the lead half-value layer is a hundredth of a millimetre; the capsule walls and a steel shutter absorb the X-rays, so the dose rate around a shielded analyser is modest, though not in the open beam. The silver isomer reaches equilibrium within minutes and is part of the same spectrum. Past the first few tenth-value layers only the gamma line is left and each further layer removes less, though lead still absorbs it strongly, the line sitting just above lead's K absorption edge.",
      "Spectrometers see the silver X-rays best through a thin entrance window, and the isomer's delay of tens of seconds keeps the gamma from summing with the capture X-rays. In fluorescence work, source lines scattered from the sample obscure silver and its neighbours, while their Compton peak serves as an internal standard. Lead's K absorption edge, lying just below the gamma energy, makes the line well suited to exciting lead K X-rays in living bone, where normalising them to elastically scattered gamma photons largely cancels the effect of geometry.",
      "The half-life of a little over a year sets the replacement cycle for analyser sources, one reason, besides licensing and transport, that many instruments now use miniature X-ray tubes. One published alloy-analyser procedure asks for monthly normalisation of its Cd-109 models but none for Am-241, whose half-life is several centuries. A disused analyser source loses most of its activity within a few years yet keeps a few thousandths after a decade, so it remains a sealed source to account for.",
    ],
    sources: [
      { label: "LNHB / DDEP, Recommended nuclear data tables: Cd-109", href: "https://www.lnhb.fr/nuclides/Cd-109_tables.pdf" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126), lead", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/ElemTab/z82.html" },
      { label: "IAEA-TECDOC-1456, In Situ Applications of X Ray Fluorescence Techniques", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/te_1456_web.pdf" },
      { label: "Chettle, Scott and Somervaille, Lead in bone: sampling and quantitation using K X-rays excited by 109Cd, Environmental Health Perspectives", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC1519364/" },
    ],
  },
  "Ce-139": {
    heading: "Ce-139 as a low-energy calibration line",
    paragraphs: [
      "Ce-139 is a calibration nuclide that decays by electron capture to stable La-139. Its single gamma line falls between the lines of Am-241, Cd-109 and Co-57 below it and those of Cs-137 and Co-60 above, a range where the efficiency curve of a gamma spectrometer needs a measured point. For that reason it is included in many mixed-nuclide calibration standards, and it is one of the lines used to check the energy scale of detectors that work in the low-energy region.",
      "In the photon table that line appears with the lanthanum X-rays from capture and internal conversion, and the shielding figures are correspondingly small; a calibration source is handled without special shielding. The source is made by irradiating lanthanum with protons or deuterons in a cyclotron; neutron capture in Ce-138, a minor isotope of natural cerium, also yields it in a reactor but brings Ce-141 along. Its half-life of months, in the decay table, means that a calibration set has to be decay-corrected at every use and replaced within a couple of years, and the certificates that accompany such sources state the reference date for that reason.",
      "Almost every capture passes through the same excited level of La-139, so the gamma photon and a lanthanum K X-ray often arrive together. A detector whose window and front dead layer are both thin records many such pairs as one event: the gamma peak loses counts to sum peaks above it, and the efficiency taken from it reads low, worst with the source on the end cap. A thin copper absorber suppresses the X-rays and the summing with them; otherwise a calculated correction is needed. Ba-139, formed in fission and in neutron-irradiated barium, feeds the same lanthanum level and gives an identical line, but it is gone within a day.",
      "National laboratories mostly standardise Ce-139 by counting the capture X-rays and electrons in coincidence with the gamma photon, and it has been compared in the BIPM international reference system since that system began. Steel or lead absorbs the lanthanum X-rays far faster than the gamma line, which is why the tenth-value layer here is so large a multiple of the half-value layer. A disused source holding only Ce-139 decays to insignificance within a few years; in a mixed standard the long-lived components such as Cs-137 and Am-241 determine its eventual management.",
    ],
    sources: [
      { label: "LNHB / DDEP, Recommended nuclear data tables: Ce-139", href: "https://www.lnhb.fr/nuclides/Ce-139_tables.pdf" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data, isotopic abundances and fission yields)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "BIPM, Update of the BIPM comparison BIPM.RI(II)-K1.Ce-139 of activity measurements of the radionuclide Ce-139 (final report)", href: "https://www.bipm.org/documents/20126/48150609/BIPM.RI%28II%29-K1.Ce-139-2022.pdf/89e9205c-492d-fad4-ae6f-aac7c735c14d" },
      { label: "Byun J.-I., A Copper Shield for the Reduction of X-γ True Coincidence Summing in Gamma-ray Spectrometry, Journal of Radiation Protection and Research", href: "https://doi.org/10.14407/jrpr.2018.43.4.137" },
    ],
  },
  "Ce-141": {
    heading: "Ce-141 as a short-lived fission product that marks fresh fuel",
    paragraphs: [
      "Ce-141 is a fission product with a high yield and a half-life of about a month, and that combination makes it a marker of recent fission. It appears in reactor coolant when fuel cladding has failed, in the gamma spectrum of fresh fallout, and in environmental samples during the first months after a release, after which it decays away and the longer-lived cerium isotope and the caesium isotopes remain.",
      "The page shows a photon table led by one medium-soft line with praseodymium X-rays below it, and the two beta branches that between them carry every decay. In gamma spectrometry the main line is well separated from its neighbours and is one of the routine lines in fission-product analysis.",
      "Protection follows the rare-earth pattern: cerium is poorly absorbed from the gut, and the external field from a sample is governed by the gamma line listed here. Ce-141 has been used as a tracer in soil erosion studies and in oceanographic work, where its short half-life keeps the label from persisting in the environment.",
    ],
  },
  "Ce-144": {
    heading: "Ce-144 with Pr-144 as the beta heat of young spent fuel",
    paragraphs: [
      "Ce-144 is one of the fission products that dominate the activity of spent fuel during the first few years after discharge, and because its daughter Pr-144 emits one of the most energetic betas among common fission products, the pair contributes a large share of the beta heat and of the bremsstrahlung from young high-level waste. It was once considered as a fuel for radioisotope generators for exactly that reason.",
      "What this page tabulates is the parent only: a soft beta, a photon table led by a modest line and the praseodymium X-rays, and a very thin lead layer. A real Ce-144 source is a Ce-144 and Pr-144 source in equilibrium within minutes, with a hard beta and weak high-energy gammas that the parent's figures do not include; the shielding question is bremsstrahlung from that beta.",
      "Its half-life of under a year means the pair fades from waste within a decade, which is part of why reprocessing is easier after a few years of cooling. The gut absorbs little cerium, and the intake concern is inhalation of fine particles.",
    ],
  },
  "Cl-36": {
    heading: "Cl-36 as a mobile long-lived nuclide and a beta calibration source",
    paragraphs: [
      "Cl-36 reaches the field by three routes. It is produced naturally by cosmic rays and used to date groundwater and to trace salt movement through soils. It forms in reactors wherever chlorine impurities sit in a neutron flux, which puts it in graphite, in concrete and in some steels, where it is a long-lived, water-soluble anion that disposal assessments treat with care. And its beta spectrum is of a convenient energy, so sealed Cl-36 sources are among the reference sources used to calibrate contamination monitors.",
      "The beta endpoint and range figures here describe the main emission, and the photon table contains only the annihilation line, which arises from a small positron branch; the dose rate derived from that line is real but minor compared with the beta. Shielding is therefore the beta story, with a low-atomic-number layer first.",
      "Measurement is by liquid scintillation counting after separation, or by accelerator mass spectrometry for the trace levels found in groundwater and in decommissioning samples where the activity is low.",
    ],
  },
  "Cr-51": {
    heading: "Cr-51 for blood volume, kidney function and corrosion-product tracking",
    paragraphs: [
      "Cr-51 is the nuclide of two classic clinical tests: red cells labelled with chromium for blood volume and survival studies, and a chromium chelate whose clearance measures the filtration rate of the kidneys. Both rely on its single gamma line, which is counted in a well detector or a gamma camera. In reactors the same nuclide forms by activation of the chromium in stainless steel and circulates with corrosion products, where it is one of the first activation products seen after start-up.",
      "The photon table is a single line emitted in only a fraction of decays, so the dose rate per becquerel is low for the energy, and lead halves it within a couple of millimetres, as the shielding table shows. The electron-capture decay also produces vanadium X-rays below the cutoff of the table.",
      "With a half-life of weeks, Cr-51 waste decays in storage and does not persist in the environment; it is held rather than shipped. Chromium in the chelated form is cleared rapidly, and intake from labelled cells is confined to the blood compartment by design.",
    ],
  },
  "Cs-135": {
    heading: "Cs-135 as the long-lived caesium that outlasts Cs-137",
    paragraphs: [
      "Cs-135 is the caesium isotope that remains after Cs-137 has decayed. Its half-life of millions of years and its mobility in water make it one of the nuclides that long-term safety assessments of geological disposal follow explicitly, even though its activity in fresh fuel is small. Its yield depends on the neutron flux during irradiation, because the precursor Xe-135 captures neutrons strongly, so a sample's Cs-135 to Cs-137 ratio is a signature of the reactor that produced it.",
      "The page shows a soft beta and nothing else; nothing photon-like betrays it, and the Cs-137 in the same sample swamps any beta measurement. Cs-135 is therefore determined by mass spectrometry after the caesium has been separated, with the two isotopes resolved from each other and from barium.",
      "For protection it is a minor contributor to any realistic intake, far below the Cs-137 that accompanies it; its importance is as a disposal and forensic nuclide rather than an operational hazard.",
    ],
  },
  "Eu-154": {
    heading: "Eu-154 as a burn-up indicator and a hard-spectrum calibration source",
    paragraphs: [
      "Eu-154 forms from stable europium by neutron capture, so it appears in irradiated fuel, where its ratio to Cs-137 indicates burn-up, and in reactor shield concrete alongside Eu-152. In fuel the europium that captures the neutron is itself a fission product, so Eu-154 rises faster than burn-up while Cs-137 rises roughly in proportion; the ratio generally grows with burn-up, but power history shifts it and measured assemblies scatter widely. Its gamma spectrum is rich and extends beyond a mega-electronvolt, and the IAEA lists Eu-154 among its recommended standards for detector efficiency calibration, alongside Eu-152.",
      "Safeguards gamma spectrometry of spent fuel measures Eu-154 alongside Cs-134 and Cs-137; once Cs-134 has faded, the ratio of Eu-154 to Cs-137 can still be used to check burn-up on long-cooled assemblies, with a wider uncertainty. In short-cooled fuel the strong mid-spectrum line and a weaker neighbour lie within a kilo-electronvolt of the two main Zr-95 lines, so while Zr-95 persists, Eu-154 is better quantified from its leading line.",
      "Almost every decay is a beta transition to excited states of Gd-154, with a very weak electron-capture branch to samarium; the gadolinium cascade fills this page's photon table with hard lines and makes the lead half-value layer thick. As with Eu-152, the cascade calls for true-coincidence summing corrections, since efficiency points taken close to the detector are otherwise biased. The leading line also lies closer to the only gamma line of Na-22 than a germanium detector can resolve, so with both present, Eu-154 is quantified from its other lines and its share is removed from that peak before Na-22 is reported.",
      "With a half-life of years, Eu-154 outlives the first decade of cooling but not the first century, and in activated concrete it adds to the dismantling dose rate, usually well behind Eu-152. Trace europium and samarium in the raw materials of concrete and reactor graphite yield enough Eu-152 and Eu-154 to call for precautions early in decommissioning. Cores drilled into a shield wall give the activation profile that decides how much concrete leaves as radioactive waste. Little europium crosses the gut wall, but inhaled europium gives a far higher dose per becquerel, so external exposure usually governs handling while dust from cutting activated concrete still calls for control.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data and fission yields)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "LNHB / DDEP, Recommended data: Eu-154 (Chechev and Kuzmenko)", href: "https://www.lnhb.fr/nuclides/Eu-154_tables.pdf" },
      { label: "IAEA Technical Reports Series No. 389, Radiological Characterization of Shut Down Nuclear Reactors for Decommissioning Purposes", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/TRS389_scr.pdf" },
      { label: "Vo et al., Passive gamma analysis of the boiling-water-reactor assemblies, Nuclear Instruments and Methods in Physics Research A (2016)" },
      { label: "IAEA, Update of X Ray and Gamma Ray Decay Data Standards for Detector Calibration and Other Applications, Volume 1", href: "https://www-pub.iaea.org/MTCD/publications/PDF/Pub1287_Vol1_web.pdf" },
    ],
  },
  "Fe-55": {
    heading: "Fe-55 as the invisible bulk of activity in irradiated steel",
    paragraphs: [
      "Fe-55 forms by neutron capture on the iron of reactor vessels, internals and pipework, and during the first decade after shutdown it is usually the single largest activity in irradiated steel, exceeding Co-60 by a wide margin. It is also invisible: the decay is by electron capture and the only emissions are manganese X-rays and Auger electrons, all below the cutoff of this dataset, which is why the page shows a half-life and a specific activity and nothing else.",
      "That invisibility makes it a hard-to-measure nuclide. Characterisation of steel for disposal or clearance uses scaling factors to Co-60, which has a photon to count, backed by sampling with chemical separation and X-ray counting or liquid scintillation. A survey meter on a component sees only the cobalt.",
      "Fe-55 also has a quiet industrial life as a soft X-ray source: its manganese X-rays are the standard for checking the energy resolution of X-ray detectors and for exciting light elements in fluorescence analysers. Its intake hazard is low, and iron is handled by the body like any iron.",
    ],
  },
  "Fe-59": {
    heading: "Fe-59 as the iron tracer with penetrating gammas",
    paragraphs: [
      "Fe-59 is the isotope used to trace iron: in ferrokinetic studies of blood formation, in the absorption of dietary iron, and in engineering, where a component irradiated to produce Fe-59 is run in a machine and its wear is measured from the activity appearing in the lubricant. In reactors it forms by activation of the heavier stable iron isotope and travels with corrosion products in the primary circuit.",
      "Its two gamma lines are energetic, as the photon table shows, and lead needs most of a centimetre to halve the field; it is one of the more penetrating tracer nuclides and is counted easily through tissue and through machine casings. Each decay emits a beta, mostly of modest energy; the range figures belong to a rare harder branch, and the hard gamma lines still decide the shielding.",
      "The half-life of weeks, in the decay table, suits a study of a few months and means that waste decays in storage. Iron is retained in the body by design, so an administered dose stays until the labelled cells are turned over, and that retention is what the clinical studies measure.",
    ],
  },
  "Ge-68": {
    heading: "Ge-68 as the generator parent and calibration source for PET",
    paragraphs: [
      "Ge-68 is the parent of Ga-68 and the reason that nuclide is available without a cyclotron on site: a Ge-68 generator loaded with the parent delivers Ga-68 for months. The same pair, sealed in epoxy or in a cylinder, is the standard calibration and normalisation source for PET scanners, where the annihilation photons from the Ga-68 daughter are what the scanner needs.",
      "Ge-68 itself decays by electron capture without any emission that clears this dataset's cutoff, so the page carries a half-life and a specific activity only. Everything a meter or a scanner sees from a Ge-68 source is the daughter, in equilibrium within hours, and the shielding of a generator is designed for annihilation photons and the positron.",
      "The half-life of most of a year sets the generator's working life and the replacement cycle for scanner sources, and it is produced in cyclotrons by irradiating gallium. Disused generators are returned to the supplier rather than discarded, both for the residual activity and for the germanium.",
    ],
  },
  "Hg-203": {
    heading: "Hg-203 as a mercury tracer and a medium-energy calibration line",
    paragraphs: [
      "Hg-203 is the long-lived radioactive isotope of mercury used to trace the element through the environment and the body: the uptake of mercury by fish and plants, the fate of mercury compounds in toxicology, and, historically, the localisation of a mercury-containing drug in the kidney. It is produced by irradiating natural mercury in a reactor, and it has a second life as a calibration nuclide because its one strong gamma line falls in a useful part of the spectrum.",
      "The photon table here is dominated by that single line with thallium X-rays beneath it, so the half-value layer figures are those of one energy and are straightforward to apply. A soft beta precedes the gamma in nearly every decay; the range figures are worked out for a far rarer, harder branch and overstate what stops it.",
      "With a half-life of weeks, laboratory waste is held for decay. The chemical toxicity of mercury rather than the radiation is the controlling hazard in most tracer work, and labelled organomercury compounds are handled with the containment that the chemistry demands.",
    ],
  },
  "Ho-166": {
    heading: "Ho-166 as a therapeutic beta emitter for liver and joint treatment",
    paragraphs: [
      "Ho-166 is a therapy nuclide. Microspheres loaded with holmium are injected into the hepatic artery to treat liver tumours, holmium chitosan complexes have been used for liver and joint treatments, and the energetic beta delivers the dose within a few millimetres of tissue. It is produced in a reactor from stable holmium, or carrier-free from a dysprosium parent, and its half-life of about a day fits a procedure done the same day the activity arrives.",
      "The page shows an energetic beta with range figures and omits any photon section, because the dataset records no line for Ho-166 above its cutoff. In practice the nuclide emits a weak gamma that is used to image the distribution of microspheres after treatment, and holmium is also paramagnetic, so magnetic resonance imaging can show the same thing.",
      "External exposure of staff is a beta and bremsstrahlung question, with acrylic shielding first, and waste decays to background within a couple of weeks. Patients are released on the basis of the modest photon emission rather than held.",
    ],
  },
  "I-129": {
    heading: "I-129 as the permanent iodine of reprocessing and disposal",
    paragraphs: [
      "I-129 is the iodine isotope that does not go away. Its half-life of millions of years, its high fission yield and the mobility of iodide in water make it one of the handful of nuclides that dominate long-term dose estimates for geological repositories, and it is the nuclide released to sea and air from reprocessing plants that can be traced across oceans and in soils for decades. Natural I-129 exists too, from cosmic rays and from spontaneous fission of uranium, and the man-made excess over that background is a global tracer.",
      "The page carries a soft beta and range figures, and the dataset records no photon line, although the nuclide emits a soft gamma and xenon X-rays that low-level gamma counting uses. At the trace levels found in the environment it is measured by accelerator mass spectrometry, which can detect it in a thyroid, a seaweed sample or a core of sediment.",
      "Its dose coefficient is high for a beta emitter because iodine concentrates in the thyroid, but the activity involved in any realistic exposure is minute; its importance is in assessments spanning thousands of years, not in operational protection.",
    ],
  },
  "Mo-99": {
    heading: "Mo-99 as the parent in every technetium generator",
    paragraphs: [
      "Mo-99 is the parent of Tc-99m, the nuclide used in most diagnostic nuclear medicine scans: Tc-99m can be eluted several times a day, for a week or two, from a generator in which Mo-99 is held on alumina. Most of it is made by fission of uranium targets in a handful of research reactors, and shutdowns of those reactors have caused repeated shortages; neutron capture on molybdenum, already routine in some countries, and accelerator routes are being developed further to spread the risk. Capture-made Mo-99 is diluted by stable molybdenum, which alumina holds only in limited amounts, so it needs a far larger column whose dilute eluate must then be concentrated, a gel generator or another separation method.",
      "The tables describe the parent: a hard photon spectrum, an energetic beta and a substantial lead half-value layer. That is why a generator is a heavy lead, tungsten or depleted-uranium block and why the quality control of each elution includes a breakthrough test for the parent. Since the parent decays far more slowly than its daughter, the Mo-99 share of an eluate rises after elution, so a vial that passes when drawn can fail the pharmacopoeial limit hours later.",
      "Most decays pass through Tc-99m, which regrows within hours of each elution and reaches transient equilibrium after a few days, just below the parent since some decays bypass the isomer. Its soft line is not in the dose figures here, so an unshielded source reads well above this page's constant, yet a couple of millimetres of lead remove nearly all of that excess, leaving the parent's lines to set the shield. DDEP lists the pair in equilibrium and ENSDF, like this page, the parent alone, so a spectrometry library must suit the sample. With a germanium detector, Mo-99 is measured by its strongest line or the softer gamma in cascade with it, and at close geometry both need a summing correction.",
      "Because the parent's half-life is a few days, a generator stays useful for a week or two and is then returned to its supplier or disposed of under local rules; the spent column still holds a little long-lived Tc-99 and possibly traces of production impurities. Staff dose arises during generator changes and elution; the parent's beta stays inside the column housing, but the bremsstrahlung it produces there adds to the photon field.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "LNHB / DDEP, Recommended nuclear data tables: Mo-99", href: "https://www.lnhb.fr/nuclides/Mo-99_tables.pdf" },
      { label: "IAEA Nuclear Energy Series NF-T-5.4, Non-HEU Production Technologies for Molybdenum-99 and Technetium-99m", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1589_web.pdf" },
      { label: "IAEA-TECDOC-1065, Production Technologies for Molybdenum-99 and Technetium-99m", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/te_1065_prn.pdf" },
    ],
  },
  "Na-24": {
    heading: "Na-24 as the activation product of sodium in coolant, concrete and people",
    paragraphs: [
      "Na-24 forms when ordinary sodium captures a neutron, and it is met wherever sodium sits in a neutron field. In a sodium-cooled fast reactor it is the dominant activity of the primary coolant and the reason the primary circuit is inaccessible during operation. It appears in concrete and in soil around accelerators and reactors for a day or two after irradiation. And after a criticality accident the Na-24 produced in a person's own blood is the quickest measure of the neutron dose they received.",
      "The two gamma lines are among the most energetic on this site, as the photon table shows, and the lead layer here is correspondingly thick; a Na-24 source is also a check of a detector's response at the top of its range. Its energetic beta is recorded too, though outside the source the gamma field is what governs.",
      "A half-life of hours means the problem solves itself quickly: coolant activity falls to a small fraction within a few days of shutdown, and any waste is held rather than treated. Sodium taken into the body is distributed everywhere and excreted at the body's own rate.",
    ],
  },
  "Nb-95": {
    heading: "Nb-95 as the daughter line in the zirconium-niobium pair",
    paragraphs: [
      "Nb-95 is the daughter of the fission product Zr-95 and is almost always met alongside it: in spent fuel, in reactor coolant after cladding failure, in the fallout from weapons tests and in the environment after a reactor accident, where the pair was a marker of fresh fission. Because the daughter's half-life is comparable with the parent's, the two reach a transient equilibrium in which the niobium activity exceeds the zirconium activity.",
      "The photon table on this page is in effect a single line, emitted in nearly every decay, which makes Nb-95 one of the cleanest lines in a fission-product spectrum and a convenient reference for the energy region above the caesium line. The lead half-value layer figures are therefore those of one energy.",
      "Niobium also forms Nb-95 by activation in zirconium alloys and in some steels. Its half-life of weeks means it has decayed from any waste within a year, and the pair's ratio in a sample can be used to estimate the time since fission.",
    ],
  },
  "Ni-59": {
    heading: "Ni-59 as the long-lived companion of Ni-63 in reactor steel",
    paragraphs: [
      "Ni-59 forms by neutron capture on the most abundant nickel isotope, so every stainless steel and nickel alloy that has been in a reactor carries it, and with a half-life of tens of millennia it stays in the inventory long after Ni-63 has gone. It decays by electron capture, emitting cobalt X-rays and Auger electrons too soft for the cutoff used here, so the page carries no emission tables, only a half-life and a specific activity.",
      "It is one of the long-lived hard-to-measure nuclides that drive the classification of decommissioning waste. Characterisation uses scaling factors against Co-60 in the same component, supported by sampling, radiochemical separation and X-ray or mass-spectrometric measurement, since nothing can be seen from outside.",
      "The radiological hazard is slight: a weak emitter with a low dose coefficient. Its importance is administrative, in the inventories and the long-term safety case for disposal of activated metal, and in the clearance of steel for recycling.",
    ],
  },
  "P-33": {
    heading: "P-33 as the gentler phosphorus label",
    paragraphs: [
      "P-33 is used in molecular biology for the same labelling tasks as P-32 but with a beta of much lower energy. The softer beta gives sharper bands in sequencing and electrophoresis gels because the emission travels less far in the film, it halves the external dose problem that P-32 poses on the bench, and its half-life, longer than that of P-32, lets a labelled probe keep for more experiments. It is made in a reactor from sulphur, which is why it is carrier-free.",
      "The page shows a beta endpoint, a range table and bremsstrahlung fractions, and no photon section; the emission is beta only. The range in acrylic is small enough that a vial wall and a glove are a complete shield, and bremsstrahlung from lead is irrelevant at this energy.",
      "Detection is by liquid scintillation, since a thin-window probe responds weakly to a beta this soft. Phosphate is incorporated into bone and nucleic acids after intake, and the usual precautions against contamination of hands and surfaces apply.",
    ],
  },
  "Pm-147": {
    heading: "Pm-147 in luminous paint, gauges and nuclear batteries",
    paragraphs: [
      "Pm-147 replaced radium in luminous paint for watches and instrument dials after the hazards of radium became clear, and it remains the beta source in many thickness gauges for paper, plastic and metal foil. It was also the fuel of early betavoltaic nuclear batteries. The nuclide is a fission product recovered from spent fuel, and in high-level waste it is one of the main beta emitters during the first years of cooling.",
      "It is almost a pure beta emitter: the photon table on this page contains a weak line that carries a tiny dose rate, and the figures show how small the external photon field is. The beta is soft and the range table shows that thin materials stop it, so a painted dial or a gauge source is contained by its own encapsulation.",
      "With a half-life of a few years, Pm-147 paint fades within a decade, and gauge sources are replaced on that cycle. Its intake hazard is that of a rare earth deposited in bone and liver, and old luminous items are handled as sealed objects rather than opened.",
    ],
  },
  "Pr-144": {
    heading: "Pr-144 as the energetic beta that accompanies Ce-144",
    paragraphs: [
      "Pr-144 is the short-lived daughter of the fission product Ce-144, and it is in equilibrium with its parent within an hour or two of any separation. Its beta endpoint is among the highest on this site, so the pair is a significant source of beta heat and bremsstrahlung in young high-level waste, and a Ce-144 source is for practical purposes a Pr-144 beta source.",
      "The page shows that beta with its range and bremsstrahlung figures and no photon section; this dataset records nothing above its cutoff, though in practice Pr-144 emits weak gamma lines at high energy that gamma spectrometry uses to quantify the parent. Shielding of a cerium-praseodymium source is a bremsstrahlung problem, with a low-atomic-number layer first and lead outside it.",
      "Separated Pr-144 has no practical use because its half-life is minutes; it matters as the active half of a parent-daughter pair and in the dosimetry of fission-product mixtures in the first years after discharge.",
    ],
  },
  "Rh-106": {
    heading: "Rh-106 as the active partner of Ru-106 and the beta of eye plaques",
    paragraphs: [
      "Rh-106 lives for seconds, so it is never handled on its own, but it is the part of the ruthenium-rhodium pair that does the work. Its beta is the most energetic among the common fission products, and its gamma lines, which the long photon table on this page lists, are what gamma spectrometry uses to quantify Ru-106 in spent fuel, in reprocessing effluent and in environmental samples. In ophthalmic brachytherapy plaques the Rh-106 beta delivers the dose to the tumour while the ruthenium parent provides the shelf life.",
      "The range table shows the beta travelling further in tissue than almost any other on the site, and the bremsstrahlung fraction in lead is correspondingly large; a Ru-106 and Rh-106 source is shielded with a low-atomic-number layer first. The dose rate figures here apply to a source in equilibrium, which any ruthenium source is.",
      "The dosimetry of eye plaques is a beta dosimetry problem solved with thin detectors and depth-dose curves, and the half-life of the pair, a year in effect, is set by the parent rather than by the rhodium.",
    ],
  },
  "Ru-106": {
    heading: "Ru-106 as a reprocessing marker and an eye-plaque source",
    paragraphs: [
      "Ru-106 is a fission product with a half-life of about a year, and its chemistry makes it awkward: ruthenium forms a volatile tetroxide during fuel dissolution and evaporation, so it is the nuclide most often associated with releases from reprocessing plants, and an unexplained Ru-106 cloud detected across Europe in the recent past was traced to an industrial facility of that kind. It is also the parent in ophthalmic plaques for treating tumours of the eye.",
      "Its own beta is very soft, as the figures on this page show, and there is no photon line; everything a detector sees from a ruthenium source is the daughter Rh-106, whose energetic beta and gamma lines dominate within minutes. The page for that daughter describes the emissions that actually matter, and this one supplies the half-life that governs the pair.",
      "Ruthenium is poorly absorbed from the gut, and in the environment Ru-106 is found on vegetation and in air filters after a release. Its presence in a sample dates the fission to within a few years.",
    ],
  },
  "S-35": {
    heading: "S-35 as the sulphur label in protein and metabolic studies",
    paragraphs: [
      "S-35 labels proteins through the sulphur-containing amino acids, and it was for decades the routine isotope for following protein synthesis in cells and for sequencing by the older chemical methods. It also traces sulphate through soils, waters and biological systems. The nuclide is produced in a reactor from chlorine, and it has a half-life of months, long enough for the labelled compounds to be stocked.",
      "The emission is a soft beta only, so the page shows an endpoint, range figures and bremsstrahlung fractions and no photon section. A vial wall is a complete shield, external dose is negligible, and detection is by liquid scintillation or by autoradiography of gels.",
      "The specific hazard is chemical rather than radiological: labelled methionine releases volatile sulphur compounds, so stock vials are opened in a fume cupboard and incubators are vented. Sulphur taken in is distributed through the body and cleared at its normal pace, and waste is held for decay.",
    ],
  },
  "Sb-124": {
    heading: "Sb-124 as a photoneutron source and an activation product of antimony in reactor coolant",
    paragraphs: [
      "Sb-124 has two principal gamma lines energetic enough to split the beryllium nucleus, so a capsule of antimony inside a beryllium shell is a photoneutron source with a nearly monoenergetic output. The stronger line gives neutrons of a few tens of keV, the weaker a small faster group. Such sources are used to calibrate neutron detectors and as start-up sources in reactors, and they have the convenient property that the neutron output falls away as the antimony decays and can be restored by re-irradiation. Behind lead they have calibrated dark-matter detectors, and a newer design adds iron, which passes these neutrons but attenuates photons.",
      "Sources are made by irradiating natural antimony in a reactor, then waiting some weeks for the co-produced Sb-122 to decay. In reactor circuits Sb-124 forms when antimony released from pump bearings and seals, or from trace impurities in structural materials, is carried to the core and activated there; fission adds almost nothing, because the decay chain of fragments of that mass stops at stable tin. In CANDU coolant, dissolved antimony is mostly uncharged and poorly held by resins in reducing chemistry; oxidising outage conditions let anion resin remove it.",
      "Nearly every decay passes through the level emitting the line seen most often, so the other lines coincide with it and a sample counted close to the detector loses counts to sum peaks. In reactor water that line sits a couple of keV from the main Cs-134 line, unresolved in sodium iodide and separated in germanium only by fitting the doublet. The beta endpoint and ranges here belong to the hardest of several branches, close to that of Y-90, although most decays take softer ones.",
      "This page's photon table runs to many hard lines, with a lead half-value layer among the larger ones on the site, so a bare Sb-124 source is a penetrating gamma emitter before neutrons arise. For the hard lines lead removes hardly more per kilogram than steel or concrete, and thick lead leaves a hardened field. The neutron output of an antimony-beryllium source is not part of these figures, and its photons outnumber its neutrons by orders of magnitude. Its two-month half-life sets the re-irradiation cycle of photoneutron sources and allows activated parts to be held for decay. Inhaled oxide particles can stay in the lungs for months, but the external gamma field is the practical concern.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data and fission yields)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "Biekert et al. (SPICE/HeRALD Collaboration), A portable and monoenergetic 24 keV neutron source based on Sb-124/Be-9 photoneutrons and an iron filter, Journal of Instrumentation 18 (2023) P07018", href: "https://arxiv.org/abs/2302.03869" },
      { label: "Burany, Suryanarayan and Husain, Assessment of Alternate Ion Exchange Resins for Improved Antimony Removal from the Primary Heat Transport System, Canadian Nuclear Society Annual Conference (2015)", href: "https://proceedings.cns-snc.ca/index.php/pcns/article/view/6923" },
      { label: "NIST, X-Ray Mass Attenuation Coefficients (SRD 126)", href: "https://physics.nist.gov/PhysRefData/XrayMassCoef/cover.html" },
    ],
  },
  "Sb-125": {
    heading: "Sb-125 as a persistent antimony nuclide of fuel and effluent",
    paragraphs: [
      "Sb-125 is produced both by fission, in a small yield, and by activation of tin and antimony in cladding and components, and it is one of the medium-lived nuclides that remain in reprocessing effluent and in spent-fuel spectra after the first few years. It feeds a short-lived tellurium daughter whose X-rays and soft gamma add to its spectrum, and it has been detected in environmental samples after reactor accidents at low levels.",
      "The photon table here is long, with the dose rate spread across several medium-energy lines, and the shielding figures reflect that spread rather than a single energy. The beta branches of Sb-125 are of modest energy, and the range figures reflect the hardest of them.",
      "A half-life of a few years lets Sb-125 outlast the ruthenium and cerium isotopes of young waste and then gives way to the caesium and strontium isotopes. It has occasional use as a calibration nuclide where a medium-energy multi-line source is wanted.",
    ],
  },
  "Sc-46": {
    heading: "Sc-46 as the tracer in sediment, reservoir and wear studies",
    paragraphs: [
      "Sc-46 is a tracer nuclide. Glass beads or sand grains loaded with it are released to follow sediment transport in harbours and estuaries, it is injected into oil reservoirs and process plant to measure flow and residence time, and components doped with scandium are irradiated to follow wear. It is made by irradiating natural scandium in a reactor, and a half-life of months suits a field study of a season.",
      "Its two gamma lines are energetic and emitted in every decay, as the photon table shows, which is what makes a small activity detectable through water, sediment or pipe walls, and the lead on this page thins the field only slowly, needing close to a centimetre to halve it. Nearly every decay gives a soft beta beside the two hard lines that follow it; the range figures belong to a rare, much harder branch and overstate what stops the usual beta.",
      "The external field is the practical concern during source preparation and injection, and the tracer is chosen partly because the activity decays to background before the study area is used again. Scandium is poorly absorbed from the gut.",
    ],
  },
  "Se-79": {
    heading: "Se-79 as the long-lived selenium that disposal models follow",
    paragraphs: [
      "Se-79 is a fission product whose importance lies entirely in the far future. Its half-life of hundreds of millennia and the chemistry of selenium, which in oxidising water forms anions that pass through clays and iron oxides with little retardation, make it one of the few nuclides that dominate long-term dose estimates in repository safety cases. It is the reason the selenium-iron system is a standard example in geochemical transport modelling, and it is the nuclide behind the selenium example on the disposal lab of this platform.",
      "The page shows a soft beta and range figures and no photon section; there is nothing to see from outside, and at the activity levels present in waste it is measured by mass spectrometry after separation, or by liquid scintillation. For many years its half-life itself was poorly known, and the value in the decay table rests on measurements made in recent decades.",
      "In the body selenium is an essential element, so Se-79 is handled by the same pathways and excreted at a measurable pace; the dose coefficient is moderate. Its operational hazard is negligible compared with its role in assessments spanning geological time.",
    ],
  },
  "Si-32": {
    heading: "Si-32 as a cosmogenic chronometer carrying a P-32 daughter",
    paragraphs: [
      "Si-32 is produced by cosmic rays acting on argon in the atmosphere, falls out with rain and is used to date groundwater, sediments and glacier ice on a scale of a few centuries, filling a gap between the shorter and longer cosmogenic clocks. It is also made in accelerator targets, and it is the one silicon isotope that matters in the characterisation of spallation sources. Its own half-life, listed in the decay table, was uncertain for a long time, and the dating methods built on it inherited that uncertainty.",
      "Its beta is soft, as the figures show, but Si-32 is never alone: its daughter P-32 grows in over a few weeks with a beta many times more energetic, and it is that daughter's emission that beta counting detects. A Si-32 sample is in practice a P-32 source of constant activity, renewed by the parent.",
      "There is no photon, so the page has no shielding section, and the practical shielding question belongs to the daughter: acrylic first, because of bremsstrahlung. Measurement for dating uses accelerator mass spectrometry or the ingrowth of P-32 after chemical separation.",
    ],
  },
  "Sm-151": {
    heading: "Sm-151 as a fission-product neutron poison and a quiet waste nuclide",
    paragraphs: [
      "Sm-151 is a fission product with two reputations. In an operating reactor it is a strong neutron absorber that builds up over the life of the fuel and has to be allowed for in core calculations. In waste it is a beta emitter with a half-life of decades, as the decay table shows, that contributes to the long-term heat and activity of high-level waste after the short-lived fission products are gone.",
      "Its beta is very soft and its gamma emission is negligible, so the page shows a small range table and no photon section; Sm-151 counts among the hard-to-measure nuclides and is determined by liquid scintillation after a chemical separation that has to remove the far more active europium and caesium. The dataset records no photon line, which here reflects the physics.",
      "Samarium is poorly absorbed from the gut and deposits in bone and liver, and the dose coefficient is low for a beta this soft. It also forms by activation of samarium in control rods and in neutron-absorber materials.",
    ],
  },
  "Sn-113": {
    heading: "Sn-113 as an In-113m generator parent and a calibration line",
    paragraphs: [
      "Sn-113 decays by electron capture to an isomeric state of indium, and the gamma line that leads this page's photon table belongs to that daughter, In-113m, which follows its parent within hours. The pair was once the basis of a generator for diagnostic imaging before technetium generators took over, and sealed Sn-113 sources remain in calibration sets because the daughter line sits in a sparsely populated part of the spectrum.",
      "The lead layer on this page is small because indium X-rays make up much of the emission, while the daughter line is what a spectrometer actually uses. Tin is activated in solder and in some bearing alloys, so Sn-113 appears at low levels in the corrosion-product spectra of reactor circuits.",
      "A calibration source lasts a year or two, given the half-life in the decay table, and must be decay-corrected at every use. Tin is poorly absorbed and the intake hazard is slight.",
    ],
  },
  "Sr-85": {
    heading: "Sr-85 as the tracer and yield monitor for strontium work",
    paragraphs: [
      "Sr-85 is the strontium isotope with a gamma line, and that single fact gives it its uses. In radiochemistry it is added as a yield monitor when Sr-90 is determined in milk, soil or urine, because its line can be counted on the final precipitate to show how much strontium survived the separation. It was once a bone-scanning agent, and it is a convenient calibration nuclide close to the annihilation energy. It is produced from rubidium in a cyclotron or by neutron irradiation of enriched strontium.",
      "One line emitted in almost every decay makes up the photon table here, with weak companions, so the shielding figures are effectively single-energy. There is no beta, the decay being electron capture, so a Sr-85 source is a clean gamma source.",
      "Stocks must be renewed every few weeks, and waste decays in storage. Strontium follows calcium into bone, which is the basis of both its old imaging use and its intake hazard.",
    ],
  },
  "Sr-89": {
    heading: "Sr-89 for bone pain and as a fission product that confounds Sr-90 analysis",
    paragraphs: [
      "Sr-89 is the strontium isotope given to patients for the palliation of bone pain from metastases: as the chloride it deposits where bone is being remodelled and its beta delivers the dose there. It is also a high-yield fission product living for weeks, so it dominates the strontium activity of fresh fission products and is a marker of a recent release, in contrast to the long-lived Sr-90.",
      "Here an energetic beta with its range figures sits beside a photon table containing one line that is emitted in a tiny fraction of decays; the dose rate derived from it is correspondingly small, and the external hazard of a source is beta and bremsstrahlung. The lead figures on this page are honest about the photon and silent about the beta.",
      "In environmental analysis Sr-89 is the nuisance: it is chemically identical to Sr-90, so a strontium separation followed by beta counting sees both, and the two are told apart by counting the Y-90 ingrowth or by waiting for the Sr-89 to decay. Patients are released with advice about excreta rather than held.",
    ],
  },
  "Ta-182": {
    heading: "Ta-182 as an activation product of tantalum and a legacy radiography source",
    paragraphs: [
      "Ta-182 forms by neutron capture on tantalum, which is used for reactor components, accelerator targets and capsules because of its corrosion resistance, so irradiated tantalum is a strong gamma source for months. Historically Ta-182 wire was used for interstitial brachytherapy and as an industrial radiography source, and it remains a tracer nuclide in wear and flow studies.",
      "Its photon spectrum is rich and extends to high energies, as the long photon table shows, and the lead layer this page gives is among the thicker ones; a tantalum component removed from a reactor is handled remotely for that reason. The range and bremsstrahlung figures are worked out for the hardest beta branch, which is rare; most decays emit much softer betas.",
      "Over a half-life of months the activity of irradiated tantalum drops to a small residue within a few years, which is why tantalum does not feature in long-term decommissioning inventories as the nickel and niobium isotopes do. Tantalum is poorly absorbed, and the external field is the practical hazard.",
    ],
  },
  "Tc-99": {
    heading: "Tc-99 as the long-lived residue of technetium and the fuel cycle",
    paragraphs: [
      "Tc-99 is the nuclide that every Tc-99m dose leaves behind, and in that form it is a trivial activity. In the fuel cycle it is a different matter: it has a high fission yield, a half-life of hundreds of millennia and a chemistry that keeps it in solution as pertechnetate in oxidising water, so it figures among the nuclides that dominate long-term assessments of geological disposal. It contaminates recycled uranium and the enrichment plants that process it, and its discharges from reprocessing can be traced in seaweed and shellfish along whole coastlines.",
      "A soft beta with its range figures is all the page carries, as the physics dictates; Tc-99 is counted by liquid scintillation once separated or, at environmental levels, by mass spectrometry. The soft beta makes it a candidate for contamination that survey meters miss.",
      "The intake hazard is moderate, technetium being taken up by the thyroid and gut wall and cleared fairly quickly. Its operational importance is in the control of contamination in isotope production and uranium recycling rather than in dose.",
    ],
  },
  "Tl-204": {
    heading: "Tl-204 as a reference beta source and a gauge nuclide",
    paragraphs: [
      "Tl-204 is one of the few nuclides adopted as a reference beta source for the calibration of beta dosemeters and contamination monitors, alongside Pm-147 and the strontium-yttrium pair, because its beta spectrum is of intermediate energy and a half-life of a few years keeps a calibrated source stable. It is also used in thickness gauges and was used in static eliminators, and it is made by irradiating natural thallium in a reactor.",
      "Beta endpoint and range figures are all this page carries; the small electron-capture branch produces mercury X-rays that this dataset does not list, and in practice a Tl-204 source is a beta source with a faint X-ray signature. Acrylic first, then lead if anything, is the shielding order.",
      "Thallium is toxic as a chemical and is absorbed readily, so an open Tl-204 solution is handled for its toxicity as much as for its activity; sealed sources present neither problem. Disused sources decay to background within a few decades.",
    ],
  },
  "Xe-133": {
    heading: "Xe-133 in lung imaging and in the detection of nuclear tests",
    paragraphs: [
      "Xe-133 is inhaled as a gas for ventilation imaging of the lungs, and it is also one of the radioxenon isotopes whose presence in air is the clearest evidence of an underground nuclear test, because noble gases escape from rock that holds everything else back. The global monitoring network that watches for tests measures Xe-133 and its isomer at concentrations so low that releases from medical isotope production plants are a known source of false signals.",
      "Caesium X-rays dominate the photon table here, with one gamma line above them, and a fraction of a millimetre of lead halves the field; shielding is trivial. Its beta, almost all in one branch, is stopped by less than a millimetre of acrylic, as the range table shows. Being a noble gas it is not retained by the body; a release gives an external dose from immersion and a lung dose from the gas within.",
      "Exhaled imaging gas is collected in a charcoal trap, where it decays, or discharged through a dedicated exhaust rather than into the room, and reactor off-gas systems hold xenon in charcoal delay beds to let it decay before discharge. Xenon is several times denser than air, so a leak in a poorly ventilated room collects near the floor, and the exhaust for a ventilation imaging room is usually drawn at low level.",
      "Telling a test from an isotope plant depends on ratios, not on Xe-133 alone. Monitoring stations compare it with Xe-131m, Xe-133m and Xe-135, whose relative amounts differ between a fresh fission event and the steady emissions of a reactor or a production facility, and most of the systems count the collected gas by beta–gamma coincidence, others by high-resolution gamma spectrometry, to reach the sensitivity that comparison needs. The xenon released when uranium targets are dissolved to extract Mo-99 is the largest civilian background those stations see.",
      "In nuclear medicine many departments have moved ventilation studies to technetium-labelled aerosols, which need no gas delivery system, sealed exhaust or charcoal trap. Where Xe-133 is still used, the negative pressure of the imaging room and the breakthrough of the trap are what a radiation protection survey checks, together with the leak tightness of the patient's mouthpiece circuit.",
    ],
    sources: [
      { label: "CTBTO, Radionuclide monitoring", href: "https://www.ctbto.org/our-work/monitoring-technologies/radionuclide-monitoring" },
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "ICRP Publication 107, Nuclear Decay Data for Dosimetric Calculations", href: "https://www.icrp.org/publication.asp?id=ICRP%20Publication%20107" },
    ],
  },
  "Y-88": {
    heading: "Y-88 as a high-energy calibration source and a photoneutron source",
    paragraphs: [
      "Y-88 is produced in a cyclotron from strontium, and its two gamma lines, one of them among the most energetic on this site, make it a standard calibration nuclide for the upper end of a gamma spectrometer's range; it is included in many mixed-nuclide standards for that reason. The higher line also exceeds the threshold for splitting beryllium, so yttrium-beryllium capsules serve as photoneutron sources in the same way as antimony-beryllium ones.",
      "The photon table shows the two lines carrying the dose rate between them, and the lead on this page needs close to a centimetre to halve the field; the electron-capture decay also produces strontium X-rays below the table's cutoff. A Y-88 calibration source needs the same handling as a Co-60 source of similar activity.",
      "Because the half-life is months, calibration sets are decay-corrected at every use and replaced after a year or two. Yttrium deposits in bone and liver after intake, but a sealed source presents only an external field.",
    ],
  },
  "Y-90": {
    heading: "Y-90 as the therapeutic beta behind Sr-90 and liver radioembolisation",
    paragraphs: [
      "Y-90 emits only beta particles, with an endpoint among the highest in routine use, and it is used for that: glass or resin microspheres loaded with Y-90 go into the hepatic artery against liver tumours, Y-90 labelled antibodies and peptides treat lymphoma and neuroendocrine tumours, and Y-90 colloids are injected into joints. It is also the daughter of Sr-90, in equilibrium within weeks, and the reason a Sr-90 source behaves as it does.",
      "The page gives the energetic beta, its ranges and its bremsstrahlung fractions, and there is no photon section because there is no photon; the practical imaging of Y-90 after treatment uses the bremsstrahlung, or a minute branch of the decay that produces positron pairs and lets a PET scanner map the microspheres.",
      "Shielding is acrylic first because bremsstrahlung in lead would be the larger hazard, and extremity dose during preparation is the limiting quantity for staff. Waste decays within weeks of a treatment, and a treated patient carries little external hazard beyond the first day.",
    ],
  },
  "Y-91": {
    heading: "Y-91 as a high-yield fission product of the first months",
    paragraphs: [
      "Y-91 is produced abundantly in fission, lives for weeks, and is formed directly and from the decay of Sr-91, and it is among the nuclides dominating the beta activity of fresh fission products during the first months after a reactor shutdown or a release. It has no civilian use and is met only in spent fuel, in fallout and in the analysis of fission-product mixtures.",
      "The emission is an energetic beta, shown on the page with its range and bremsstrahlung figures; the dataset records no photon line, and in practice the one gamma line Y-91 emits is weak enough that gamma spectrometry struggles with it. Determination is by radiochemical separation of yttrium followed by beta counting, in which Y-91 must be distinguished from the Y-90 of the strontium parent.",
      "After intake yttrium lodges in bone and liver, with a moderate dose coefficient. Within a year of fission the nuclide has decayed to insignificance, which is why it does not appear in waste inventories or disposal assessments.",
    ],
  },
  "Zn-65": {
    heading: "Zn-65 from reactor zinc injection, brass and marine discharges",
    paragraphs: [
      "Zn-65 arises when the commonest zinc isotope captures a neutron, and it enters reactor circuits from brass components and from the zinc deliberately injected into coolant to reduce the dose rates caused by cobalt deposition; plants that inject zinc use material depleted in that isotope to avoid making Zn-65. It is also a tracer for zinc metabolism and, historically, a marker of reactor discharges in marine organisms, which concentrate zinc.",
      "Its photon table is dominated by one energetic line, with the annihilation line from a small positron branch beside it, and nearly a centimetre of lead is needed to halve it, as the shielding table shows. Copper X-rays from the electron capture fall below the cutoff.",
      "With a half-life of most of a year, in the decay table, Zn-65 persists through a fuel cycle and fades within a few years of shutdown. Zinc is an essential element, so Zn-65 taken in is distributed and retained as zinc is, with the whole body rather than one organ as the target.",
    ],
  },
  "Zr-93": {
    heading: "Zr-93 as the long-lived zirconium of cladding and fuel",
    paragraphs: [
      "Zr-93 is produced both by fission and by neutron capture in the zirconium alloy cladding of fuel, so it is present in spent fuel and in cladding hulls alike, and its half-life of over a million years places it in the long-term inventory of geological disposal. Its daughter Nb-93m, with a half-life of years, grows in and emits soft X-rays and electrons that are the only signal a counter can use.",
      "The tables here hold a very soft beta and its range and nothing else, which matches the physics; Zr-93 belongs to the hard-to-measure group and is determined by mass spectrometry after separation of the zirconium fraction, because beta counting cannot distinguish it from the daughter.",
      "Zirconium is poorly absorbed from the gut and is cleared from the body slowly once deposited in bone; the dose coefficient is low. Its importance is in inventories and safety cases rather than in operational protection, and it is one of the nuclides that make cladding hulls intermediate-level waste for the very long term.",
    ],
  },
  "Zr-95": {
    heading: "Zr-95 as the fission product that dates fuel cooling",
    paragraphs: [
      "Zr-95 is a high-yield fission product with a half-life of weeks, and together with its daughter Nb-95 it is one of the standard markers of fresh fission in reactor coolant, fallout and environmental samples. It also forms by activation of the cladding, so it appears in corrosion-product spectra even without a fuel failure. Because its half-life is known precisely, the ratio of Zr-95 to longer-lived nuclides in reprocessing feed is used to estimate how long the fuel has cooled.",
      "The photon table on this page is two lines of similar energy that share the dose rate, so the lead figures are straightforward. Two beta branches of similar, modest energy carry almost every decay before the gammas; the range figures belong to a rare harder branch. Its daughter adds a third line that grows in over weeks.",
      "Zirconium passes through the gut largely unabsorbed, and the gamma field from a sample is the usual concern. Within a year of fission the pair has decayed to insignificance, so it never appears in disposal inventories.",
    ],
  },
  "Au-198": {
    heading: "Au-198 as a neutron fluence monitor and a brachytherapy grain",
    paragraphs: [
      "Au-198 is made by neutron capture on the single stable isotope of gold, with a cross section and a half-life, in the decay table, that make gold foils the standard monitor of neutron fluence in reactors and accelerator fields: irradiate a foil, count its gamma, and the flux follows. The same nuclide has a long clinical history as gold grains and seeds implanted into tumours and, earlier, as colloidal gold for liver imaging and for treating malignant effusions.",
      "A lone line in nearly all decays, with a few weak companions, is the whole photon table, and the lead figures are those of a single energy. In an implanted grain the platinum sheath absorbs the energetic beta, so the dose comes from the gamma; the beta matters when gold is given as a colloid.",
      "With a half-life of days, a gold grain delivers its dose within a couple of weeks and can be left in place permanently, and foil activities decay to background in storage. Gold is inert in the body, so the intake hazard is slight.",
    ],
  },
  "Ga-67": {
    heading: "Ga-67 for imaging infection, inflammation and lymphoma",
    paragraphs: [
      "Ga-67 citrate was for decades a standard scintigraphy agent for finding infection, inflammation and lymphoma, its gallium travelling in the blood on the iron-binding sites of transferrin. Its tumour use was found by accident, when gallium citrate tried as a bone-scanning agent in cancer patients showed uptake in lymph nodes involved by Hodgkin's disease. It has been displaced in many centres by white-cell labelling and by PET, but it is still used where those are unavailable and is preferred to labelled white cells for spinal disc infection.",
      "Cyclotrons make it from zinc targets, and it is supplied as a citrate solution ready for injection. Ga-66, made in the same targets, has far harder photons but a shorter half-life, so its share falls between production and use. The daughter Zn-67 is stable, so no ingrowth needs allowing for. The zinc level behind the softest main line has a half-life of some microseconds, so that line is emitted well after the photons that feed its level. That transition also emits a conversion electron nearly as often as a photon.",
      "Three medium-soft lines, with a weaker, harder fourth, share the dose rate, and gamma cameras image them with a medium-energy collimator using two or three windows at once; the lead layer on this page is modest. The softest window is usually dropped in very obese patients and within a day or so of a Tc-99m injection. The decay is electron capture, so there is no beta, and the patient's dose comes from the photons and from the conversion and Auger electrons released close to the decay site.",
      "Its half-life allows imaging a day or more after injection, and clinic waste can be stored for a few weeks to decay. In syringe and vial shields, roughly a millimetre of lead removes the softest line and most of the second, leaving the two harder ones, so shielding ample for Tc-99m passes a noticeable gallium dose rate. Gallium is cleared slowly through the gut, which is why bowel activity complicates the images. It collects in the lactating breast too, so breastfeeding is suspended for weeks or stopped. Haemolysis or repeated transfusion, by saturating transferrin, alters where it goes, as does treatment with the iron-chelating drug desferrioxamine.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "LNHB / DDEP, Recommended data: Ga-67 decay tables", href: "https://www.lnhb.fr/nuclides/Ga-67_tables.pdf" },
      { label: "Edwards and Hayes, Tumor Scanning with 67Ga Citrate, Journal of Nuclear Medicine", href: "https://jnm.snmjournals.org/content/10/2/103" },
      { label: "Society of Nuclear Medicine, Procedure Guideline for Gallium Scintigraphy in Inflammation, Journal of Nuclear Medicine", href: "https://jnm.snmjournals.org/content/38/6/994" },
    ],
  },
  "Ga-68": {
    heading: "Ga-68 as the generator-produced positron emitter of PET",
    paragraphs: [
      "Ga-68 is the positron emitter that made receptor PET routine: labelled peptides that bind somatostatin receptors image neuroendocrine tumours, and labelled ligands for a prostate antigen have changed the staging of prostate cancer. It is eluted from a Ge-68 generator on site, so no cyclotron is needed, and its half-life of about an hour, in the decay table, fits a same-day preparation and scan while limiting the activity that can be shipped.",
      "The photon table is dominated by the annihilation line, with a weaker gamma above it, and the shielding figures on this page are those of annihilation radiation; the positron itself is more energetic than that of F-18, which slightly degrades image resolution and adds a short-range dose component. Syringe shields are tungsten.",
      "Waste decays to background within a day, and the handling concern is extremity dose during labelling. Gallium that is not bound to its ligand is cleared through the kidneys.",
    ],
  },
  "In-111": {
    heading: "In-111 for labelled white cells and receptor imaging",
    paragraphs: [
      "In-111 labels white blood cells and platelets for imaging infection and thrombosis, and bound to the peptide pentetreotide it images tumours that carry somatostatin receptors. Its decay by electron capture leaves no beta, but it emits two gamma lines of convenient energy for a gamma camera and many Auger electrons absorbed close to the decay site, which has made it a candidate for therapy when carried into a cell nucleus.",
      "Cadmium X-rays share the dose rate with those two lines, and because thin lead absorbs the X-rays first, the tenth-value layer is many half-value layers thick. Cameras use a medium-energy collimator for it, often with two energy windows together. The two gamma photons are emitted in cascade through one cadmium level, so a well counter or nearby germanium detector can record both as one event, taking counts from both full-energy peaks and adding a sum peak at their combined energy; calibrations based on single-line standards need a summing correction. In an activity calibrator the container wall absorbs part of the cadmium X-rays, so a syringe and the supplier's vial can read differently.",
      "The half-life of days suits cell-labelling studies, which image a day or two after injection, and the waste is held for a month. Activity from labelled cells settles in the spleen, liver and marrow, and little is excreted; the spleen receives the highest organ dose. Cyclotrons make it by proton irradiation of cadmium, and it is supplied as indium chloride in dilute hydrochloric acid or as the oxine complex for cell labelling. Cadmium targets leave variable traces of In-114m, whose half-life runs to weeks; an alpha-on-silver route avoids it but yields far less. Because In-114m decays so much more slowly than In-111, a month of holding leaves most of it, and a survey before disposal shows what remains.",
      "Oxine carries the indium into white cells as a neutral, lipid-soluble complex, and the metal then binds to cytoplasmic proteins. Plasma transferrin degrades that complex, so cells are labelled in saline once the plasma has been removed. Labelled cells are reinjected and cannot be sterilised, so the work is aseptic, in a laminar-flow cabinet or isolator, and different patients' cells are kept apart. Technetium-labelled cells have largely replaced indium ones, though indium cells are still preferred in the abdomen, where the technetium agent is excreted into the bowel.",
    ],
    sources: [
      { label: "LNHB / DDEP, Recommended nuclear data tables: In-111", href: "https://www.lnhb.fr/nuclides/In-111_tables.pdf" },
      { label: "IAEA Technical Reports Series No. 468, Cyclotron Produced Radionuclides: Physical Characteristics and Production Methods", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/trs468_web.pdf" },
      { label: "IAEA Technical Reports Series No. 454, Quality Assurance for Radioactivity Measurement in Nuclear Medicine", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/TRS454_web.pdf" },
      { label: "EANM, Guidelines for the labelling of leucocytes with 111In-oxine (Eur J Nucl Med Mol Imaging)", href: "https://doi.org/10.1007/s00259-010-1393-5" },
    ],
  },
  "Lu-177": {
    heading: "Lu-177 in radioligand therapy",
    paragraphs: [
      "Lu-177 has become the leading nuclide of radioligand therapy: labelled somatostatin analogues treat neuroendocrine tumours, and labelled ligands of prostate-specific membrane antigen treat advanced prostate cancer. It emits a beta of medium energy that delivers the dose within a millimetre or two of tissue, and gamma lines that let the same treatment be imaged and its dose estimated. It is made in reactors either directly from lutetium enriched in Lu-176, which produces a long-lived isomer as a by-product, or indirectly from ytterbium, which gives no-carrier-added material.",
      "Lu-176 captures neutrons so readily that direct irradiation gives a usable specific activity, but the unconverted lutetium remains as Lu-177 decays, so carrier-added material has a short shelf life for peptide labelling. The indirect route must instead extract a trace of lutetium from bulk ytterbium, which binds the same chelators. Lu-177m shares both imaging lines and its other lines are masked by fresh Lu-177, so it is measured on an aliquot left for several weeks.",
      "Both imaging lines in the photon table are stopped by thin lead, as the shielding table shows, so patient rooms need only modest shielding, and the beta, whose range figures appear here, is absorbed in the patient. Most decays reach the hafnium ground state without a photon, hence the low dose rate; the lowest-energy table entries are hafnium K X-rays. The weak photon output is also why staff receive comparatively low doses when large therapeutic activities are prepared and given.",
      "Calibrator readings for Lu-177 change with vial type and filling volume, so the calibration against a traceable standard should be done in the clinical geometry. Medium-energy collimators are preferred because they limit septal penetration, and with them the main window is centred on the upper photopeak, whose backscatter falls on the lower one. Quantitative SPECT gives the kidney and marrow doses some centres use to set the number of cycles; permanent kidney damage has been considerably less frequent with Lu-177 octreotate than with the earlier Y-90 octreotide.",
      "Lu-177 decays slowly enough for a dose to be shipped internationally and fast enough for waste to decay within a few months; the isomer that accompanies the directly produced material lasts much longer and governs the disposal of that waste. Most of the activity leaves in urine, so where wards hold excreta in tanks, the isomer is what builds up.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "LNHB / DDEP, Recommended nuclear data tables: Lu-177", href: "https://www.lnhb.fr/nuclides/Lu-177_tables.pdf" },
      { label: "Dash, Pillai and Knapp, Production of 177Lu for Targeted Radionuclide Therapy: Available Options, Nuclear Medicine and Molecular Imaging (2015)", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4463871/" },
      { label: "Ljungberg et al., MIRD Pamphlet No. 26: Joint EANM/MIRD Guidelines for Quantitative 177Lu SPECT Applied for Dosimetry of Radiopharmaceutical Therapy, Journal of Nuclear Medicine (2016)", href: "https://jnm.snmjournals.org/content/57/1/151" },
    ],
  },
  "Re-188": {
    heading: "Re-188 as a generator-produced therapy nuclide",
    paragraphs: [
      "Re-188 is a beta-emitting therapy nuclide usually eluted from a generator that holds its longer-lived parent, W-188, on an alumina column. It is used as labelled lipiodol for liver tumours, labelled phosphonates for bone pain and labelled microspheres, and historically in liquid-filled balloons for preventing restenosis after angioplasty; a paste for non-melanoma skin cancers is a newer use. Its chemistry resembles that of technetium, so many technetium labelling kits can be adapted, but perrhenate is much harder to reduce than pertechnetate, and the bone agent localises well only with stable rhenium carrier added.",
      "The generator makes the nuclide available in places without reactor supply, though the parent needs a high-flux reactor: W-188 is made by double neutron capture in tungsten enriched in W-186, and its low activity per gram of tungsten makes the column large and the saline eluate dilute. To concentrate the eluate, a silver-based cartridge removes the chloride and a small anion exchanger retains the perrhenate for elution in a small volume.",
      "Imaging of the distribution in the patient relies on one modest photon line, and a millimetre or two of lead removes most of it; the weaker, harder lines that pass thicker lead explain why the tenth-value layer spans so many half-value layers. The energetic therapeutic beta reaches up to about a centimetre into soft tissue, as the range figures here imply, and shielding during preparation is mainly a beta and bremsstrahlung matter.",
      "When NIST standardised Re-188 by liquid scintillation counting, readings at the calibrator setting then recommended proved well above the true activity, and the corrected setting differed between a reference ampoule and a clinical dose vial, so each container type needs its own check. Tungsten breakthrough, normally very low, shows as activity persisting in a retained eluate sample, since the parent decays over months; traces of Os-191 and Ir-192 made alongside the parent can linger as well.",
      "Since the half-life is hours, activity is used the day it is eluted and stored waste is down to a small fraction within about a week; the generator lasts for months. Unbound perrhenate leaves the body mainly in the urine, and the thyroid takes it up much as it does pertechnetate. A spent column still holds most of its enriched tungsten, recoverable for new targets but carrying longer-lived activity that would probably need special handling.",
    ],
    sources: [
      { label: "LNHB / DDEP, Recommended nuclear data tables: Re-188", href: "https://www.lnhb.fr/nuclides/Re-188_tables.pdf" },
      { label: "Lepareur N et al., Rhenium-188 labeled radiopharmaceuticals: current clinical applications in oncology and promising perspectives, Frontiers in Medicine (2019)", href: "https://www.frontiersin.org/articles/10.3389/fmed.2019.00132/full" },
      { label: "IAEA Radioisotopes and Radiopharmaceuticals Series No. 2, Production of Long Lived Parent Radionuclides for Generators: 68Ge, 82Sr, 90Sr and 188W", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1436_web.pdf" },
      { label: "Zimmerman BE et al., A new experimental determination of the dose calibrator setting for 188Re, Journal of Nuclear Medicine (1999)", href: "https://jnm.snmjournals.org/content/40/9/1508" },
    ],
  },
  "Tl-201": {
    heading: "Tl-201 as the thallium of myocardial perfusion imaging",
    paragraphs: [
      "Tl-201 as the chloride was the standard agent for imaging blood flow to the heart muscle for a generation, because thallium behaves like potassium and is taken up by working muscle in proportion to its blood supply. Technetium agents have replaced it in many centres, but it remains in use for rest and stress studies, and its label also covers locating parathyroid adenomas. Its Brookhaven developers expected it to give more counts per unit of patient dose than most potassium analogues. It is produced in a cyclotron, by way of a lead precursor, and keeps long enough to be shipped ready for use.",
      "Protons striking thallium enriched in Tl-203 make Pb-201, which is separated and left to decay before the thallium is drawn off without added carrier. Each batch carries traces of Tl-200, Tl-202 and Pb-203. Shorter-lived Tl-200 and Pb-203 matter more before calibration, while Tl-202 outlives Tl-201 and gains share after it; hence the advice to inject near that time and the short expiry. The contaminants' harder gamma rays cross collimator septa and blur the image, and they inflate a calibrator reading; purity is therefore judged on a germanium spectrum. As the Tl-201 photons are soft, the container wall also shifts the reading, so a setting checked on a glass vial may not suit a syringe.",
      "A gamma camera images mainly the mercury X-rays that follow the electron-capture decay, which dominate the listed photon lines, with weaker gamma lines above them; lead stops them readily, as the shielding table shows, and the energy is low for a camera, which costs some resolution. There is no beta. The same softness lets overlying breast tissue or the diaphragm mimic a perfusion defect. Thallium is still chosen for viability studies because it redistributes: the cells do not trap it, so a stress defect over ischaemic but living muscle fills in over several hours; technetium agents scarcely redistribute.",
      "A half-life of days keeps stock turnover short and suits holding imaging waste for decay, though after a month the slower-decaying Tl-202 can make up most of the remainder. Thallium's chemical toxicity is irrelevant at the trace amounts involved, but the patient's radiation dose, with the kidneys and thyroid among the organs most exposed, is higher per study than with the technetium agents, while people nearby receive less because far less activity is given.",
    ],
    sources: [
      { label: "Lebowitz E. et al., Thallium-201 for Medical Use. I, Journal of Nuclear Medicine (Brookhaven National Laboratory)", href: "https://jnm.snmjournals.org/content/16/2/151" },
      { label: "Lantheus Medical Imaging, Thallous Chloride Tl 201 Injection, US prescribing information (FDA-approved labelling)", href: "https://www.lantheus.com/assets/LCR_00182_1.0_Thallium_US_PI_515039-0318.pdf" },
      { label: "EANM procedural guidelines for radionuclide myocardial perfusion imaging with SPECT and SPECT/CT, 2015 revision", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4589547/" },
      { label: "IAEA Technical Reports Series No. 454, Quality Assurance for Radioactivity Measurement in Nuclear Medicine", href: "https://www-pub.iaea.org/MTCD/Publications/PDF/TRS454_web.pdf" },
    ],
  },
  "Sm-153": {
    heading: "Sm-153 for bone pain palliation",
    paragraphs: [
      "Sm-153 labelled with a phosphonate concentrates in bone that is being remodelled around metastases, where its beta relieves pain in most patients for a few months. It is one of the beta emitters long used for that purpose, alongside Sr-89, with the advantage that its gamma emission lets the distribution be imaged with a gamma camera. It is produced by neutron irradiation of samarium enriched in Sm-152, and a half-life of only a couple of days means each batch is shipped and injected within the week. The unconverted target atoms cannot be removed chemically and stay as carrier, unimportant for a phosphonate given with excess ligand but saturating receptor sites when a targeted molecule is labelled, so mass separation has been tried.",
      "Most of the external dose rate comes from europium X-rays after the decay and most of the rest from one gamma line of modest energy, so lead foil far thinner than a millimetre halves it; the therapeutic beta has its own range figures on the page. Soft photons and the beta both matter in the radionuclide calibrator used to assay each dose: a setting established for a glass vial over-reads the same activity in a plastic syringe, whose wall absorbs less of the beta and whose geometry differs. Patients have been under-treated in series before a syringe-specific correction was applied.",
      "The solution's own radiation breaks down the ligand, so the product is shipped frozen on dry ice and is used within hours of thawing, never refrozen. A treated patient is a weak external source and is often released the same day with advice about excreta. Activity that bone does not take up leaves in the urine within hours, so patients drink beforehand and void often, and an incontinent patient is catheterised to keep urine off clothing and bedding.",
      "The Sm-153 in stored waste falls to background within a few weeks, but neutron capture on the daughter Eu-153 during irradiation leaves a trace of long-lived Eu-154 in the product. Its share grows as the samarium decays, limiting shelf life, and it stays in the skeleton, so the product information asks that it be considered in waste disposal and when a radiation alarm is triggered. The dose-limiting effect of treatment is suppression of the bone marrow, which follows from the deposition of the phosphonate in bone, not from any external exposure.",
    ],
    sources: [
      { label: "IAEA Live Chart of Nuclides (ENSDF decay data)", href: "https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html" },
      { label: "European Medicines Agency, Quadramet (samarium-153 lexidronam) EPAR: product information and scientific discussion", href: "https://www.ema.europa.eu/en/medicines/human/EPAR/quadramet" },
      { label: "Van de Voorde M. et al., Production of Sm-153 with very high specific activity for targeted radionuclide therapy, Frontiers in Medicine (2021)", href: "https://doi.org/10.3389/fmed.2021.675221" },
      { label: "Wisconsin Department of Health Services, Information notice concerning medical events caused by failure to properly perform tests on dose calibrators for beta- and low-energy photon-emitting radionuclides (reissue of US NRC IN 2002-19; Sm-153 in glass vials and plastic syringes)", href: "https://www.dhs.wisconsin.gov/radiation/radioactivematerials/radionuclidesapril2008.pdf" },
      { label: "US NRC Information Notice 2002-19, Medical misadministrations caused by failure to properly perform tests on dose calibrators for beta- and low-energy photon-emitting radionuclides (Sm-153 unit dosages)" },
    ],
  },
  "Au-198m": {
    heading: "Au-198m as the isomer that rides along in irradiated gold",
    paragraphs: [
      "Au-198m is formed in a small fraction of the neutron captures on gold that produce Au-198, so every irradiated gold foil or grain contains a little of it. An isomeric transition returns it to the ground state over a couple of days, which is comparable with the ground state's own half-life, and its cascade of medium-soft gamma lines, listed on this page, is distinct from the single strong line of Au-198.",
      "For fluence monitoring with gold foils the isomer is a correction rather than a signal: its lines fall in a different part of the spectrum and its activity depends on the neutron energy spectrum in a different way, so laboratories that count foils promptly after irradiation either wait for it to decay or resolve it in the spectrum. Thin lead stops its photons easily, as the shielding table shows.",
      "In brachytherapy grains it adds a small, short-lived gamma component to the dose; in practice it is ignored. Its interest is mainly in nuclear structure, where the isomer's high spin explains why it lives as long as it does.",
    ],
  },
  "Ba-133m": {
    heading: "Ba-133m in freshly produced barium sources",
    paragraphs: [
      "Ba-133m is the short-lived isomer that accompanies the production of Ba-133, whether by neutron capture on barium enriched in the lighter isotope or by irradiating caesium in a cyclotron. It decays by isomeric transition to Ba-133 within a few days, so a newly made Ba-133 calibration source is left to age before its activity is certified; until then the isomer's own line and the barium X-rays listed on this page sit on top of the ground state's spectrum.",
      "Its photon table is dominated by a single gamma line with X-rays below it, and lead thins it almost at once, since the X-rays carry much of the emission count. Nobody holds Ba-133m as a source in its own right, and it never appears in an inventory.",
      "It is studied in the physics of isomeric transitions, where the spin of the state explains its lifetime, but its everyday relevance is only as a transient in barium that has just been irradiated, and as a line that an unexpectedly young source might show in a spectrometer.",
    ],
  },
  "Ba-137m": {
    heading: "Ba-137m as the photon of every caesium source",
    paragraphs: [
      "Ba-137m is the metastable state that nearly every Cs-137 decay feeds, and the famous line tabulated here is its line, not caesium's. It lives for a few minutes, so a Cs-137 source reaches equilibrium with it within half an hour of any separation, and from then on the two decay together at the parent's pace. The dose rate, half-value and tenth-value figures here are therefore the practical figures for a caesium source in equilibrium.",
      "The pair is also a teaching tool: a small Cs-137 generator from which Ba-137m is washed out with a salt solution lets students watch a half-life of minutes on a counter, with the parent safely retained on the column. The eluate is harmless within an hour.",
      "Ba-137m is never separated for any practical purpose beyond that demonstration, and it never appears in an inventory on its own. Its page exists because the dataset lists it as a nuclide, and because its figures are the ones that caesium sources actually obey.",
    ],
  },
  "Cd-109m1": {
    heading: "Cd-109m1 as a microsecond nuclear state, not a source",
    paragraphs: [
      "Cd-109m1 is an excited state of the Cd-109 nucleus that lives for a few microseconds before dropping to the ground state by gamma emission. States like this are reached when a neighbouring nucleus decays or in a nuclear reaction, and they are catalogued in the evaluated nuclear data that this site is built on because their half-lives have been measured. That is the only reason it has a page: it is not a nuclide anyone can buy, store or be contaminated with.",
      "The photon table lists the silver X-rays and the gamma that follow the transition, and the dose rate figures describe a point source that could never exist, since the state decays before any sample could be assembled. The lead half-value layer is a formality.",
      "Where the state matters is in nuclear spectroscopy, as a delayed line in the decay of In-109 and in the study of how angular momentum traps a nucleus in an excited configuration. For radiation protection it is part of its parent's decay and is counted with the parent.",
    ],
  },
  "Cd-109m2": {
    heading: "Cd-109m2 as a second short-lived state of cadmium",
    paragraphs: [
      "Cd-109m2 is another excited state of the same nucleus, a little higher in energy than Cd-109m1 and also living for microseconds. It appears in this dataset as a separate entry because the evaluation gives it its own half-life, and its de-excitation produces the pair of gamma lines in the photon table rather than the X-rays that dominate the lower state.",
      "Nothing on this page corresponds to a source that can be handled: the figures describe photons per decay for a state that is gone within a millionth of a second of being formed. The entry is kept so that the site's coverage of the evaluated data is complete and so that a reader who meets the name in a level scheme can see what it refers to.",
      "In practice the lines belong to the spectrum of whatever produced the state, most often the electron-capture decay of In-109 or an in-beam reaction, and they are attributed to that process in any measurement. The Cd-109 page describes the nuclide that is actually used, as an X-ray source for fluorescence analysis.",
    ],
  },
  "Ce-139m": {
    heading: "Ce-139m as a transient in cerium production",
    paragraphs: [
      "Ce-139m is an isomer that lives for about a minute and decays by isomeric transition to Ce-139, emitting one gamma line of medium-high energy that is nearly the whole of its photon table. It is formed in the proton or deuteron bombardment of lanthanum that produces Ce-139 for calibration sources, and in neutron reactions on cerium, and it has vanished long before any product reaches a user.",
      "Because the line is energetic, lead attenuates it only slowly, but that figure has no practical application; nobody shields Ce-139m. Its line can appear in the prompt spectrum of an irradiated target and is sometimes used to confirm the production reaction. Short-lived isomers of this kind are also used in nuclear physics to measure the lifetimes of excited states and the character of the transitions that empty them.",
      "For the ground state, which is the useful nuclide, see the Ce-139 page; the isomer contributes nothing to the activity of a certified source.",
    ],
  },
  "Co-60m": {
    heading: "Co-60m in neutron activation analysis and reactor water",
    paragraphs: [
      "Co-60m is formed in about half of the neutron captures on natural cobalt, and it decays within minutes, almost entirely by isomeric transition, into the long-lived Co-60; a small beta branch goes straight to nickel. That makes it both the gateway to Co-60 production and a convenient nuclide for neutron activation analysis: a short irradiation and a prompt count of its lines measure cobalt without waiting for the ground state.",
      "The photon table on this page is unusual in that a weak high-energy line from the beta branch carries most of the dose rate, while the soft isomeric line that identifies the nuclide carries little; the shielding figures are therefore those of the hard line. In reactor coolant Co-60m appears as a short-lived activation product wherever cobalt-bearing material is in the flux.",
      "Its half-life of minutes means it has no handling consequences of its own: any Co-60m problem becomes a Co-60 problem within the hour, and the Co-60 page describes that nuclide.",
    ],
  },
  "Cs-134m": {
    heading: "Cs-134m as the short-lived product of caesium activation",
    paragraphs: [
      "Cs-134m is formed in a fraction of the neutron captures on stable caesium, and it decays within hours by isomeric transition to Cs-134. It is used in neutron activation analysis to measure caesium with a short irradiation, and it appears briefly in reactor coolant and in irradiated caesium targets. Its emissions are soft: X-rays and one modest gamma line, as the photon table shows, with a lead half-value layer that is a small fraction of a millimetre.",
      "Because it feeds Cs-134, the isomer is one of the routes by which stable caesium in fuel becomes the gamma-emitting Cs-134 that later marks reactor-produced contamination; the Cs-134 page describes that role.",
      "A sample containing Cs-134m is in practice a sample of its longer-lived daughter within a day, and the isomer has no separate handling consequences. The dose rate figures here are the figures for the first hours after irradiation, and they are small.",
    ],
  },
  "Eu-152m1": {
    heading: "Eu-152m1 as the short-lived europium of activation analysis",
    paragraphs: [
      "Eu-152m1 is formed when the lighter stable europium isotope captures a neutron into a state that lives for hours and then decays, mostly by beta emission and partly by electron capture, to gadolinium and samarium rather than to the long-lived Eu-152. Its rich gamma spectrum, listed on this page, is the signal used in neutron activation analysis to measure europium in rocks, soils and materials with a short irradiation, and it is a prompt indicator of europium in freshly irradiated samples.",
      "The photon table is long and reaches high energies, and lead attenuates it correspondingly slowly; a freshly irradiated europium-bearing sample is a gamma source for a day or two before the isomer decays and the slow build-up of Eu-152 takes over as the lasting activity.",
      "Beyond analysis it has no use, and it never persists long enough to be a waste nuclide. Its interest is as the fast branch of europium activation, which is why Eu-152 sources made in reactors are left for a few days before being measured.",
    ],
  },
  "Eu-152m2": {
    heading: "Eu-152m2 as a minor isomer feeding Eu-152",
    paragraphs: [
      "Eu-152m2 is a higher isomer of Eu-152 that lives for about an hour and a half and decays by isomeric transition to the long-lived ground state, emitting one soft gamma line and samarium and europium X-rays, which make up its photon table here. It is populated in a small fraction of neutron captures on europium, alongside the much more prominent Eu-152m1, and its lines appear in the prompt spectrum of irradiated europium.",
      "Its emissions are so soft that lead halves them within a fraction of a millimetre, and its activity is small compared with the other europium nuclides formed in the same irradiation; it is rarely reported in activation analysis and never handled on its own.",
      "The isomer's main significance is in nuclear structure, where the spins of the europium isomers explain the branching between them, and in completeness: it is one route into the Eu-152 inventory of activated materials, which the Eu-152 page describes.",
    ],
  },
  "Eu-154m": {
    heading: "Eu-154m as the fast route to Eu-154",
    paragraphs: [
      "Eu-154m is populated in part of the neutron captures on the heavier stable europium isotope and decays within the hour by isomeric transition to Eu-154. It emits a group of soft gamma lines and X-rays, listed on this page, and it is sometimes used in activation analysis as a quick indicator of europium alongside Eu-152m1.",
      "The photon table is soft and the shielding figure is tiny, so the isomer contributes little to the external dose from a freshly irradiated sample; what remains afterwards is Eu-154 itself, with its hard spectrum and half-life of years, which the Eu-154 page describes.",
      "It brings no handling consequences of its own, and it is never found separately in waste. Its presence in this dataset reflects the evaluation's listing of every state with a measured half-life, and the figures here apply only to the first hour after irradiation.",
    ],
  },
  "Hg-203m": {
    heading: "Hg-203m as a microsecond state in the mercury level scheme",
    paragraphs: [
      "Hg-203m is an excited state of the Hg-203 nucleus with a half-life of microseconds. It is reached when a heavier mercury isotope is produced in a reaction or when a neighbouring nucleus decays into it, and it falls to the Hg-203 ground state through the pair of gamma lines this page tabulates. The evaluation that underlies this site records a half-life for the state, which is why it appears as an entry alongside the nuclides that can actually be handled.",
      "The figures on the page describe a point source that cannot be realised; a state that decays within a millionth of a second never accumulates. The lead half-value layer and the dose rate are correct for the photons and irrelevant for protection.",
      "In spectroscopy the lines serve to identify the state and measure its lifetime, and in any practical measurement they are counted as part of the process that produced the mercury. The Hg-203 page describes the tracer nuclide.",
    ],
  },
  "In-111m": {
    heading: "In-111m as a transient in the production of In-111",
    paragraphs: [
      "In-111m is an isomer of In-111 that lives for a few minutes and returns by isomeric transition to the ground state, emitting one gamma line of medium energy, the whole of its photon table here. It is produced along with In-111 when cadmium or silver targets are irradiated in a cyclotron, and it has decayed away by the time the product is purified and shipped.",
      "For the user of In-111 it does not exist; for the production laboratory it is a prompt line in the spectrum of a fresh target that confirms the yield before chemistry begins. Lead attenuates it moderately, and the figure has no application.",
      "Isomers like this one are also used to study the structure of indium nuclei, where the sequence of states explains why the ground state decays by electron capture while the isomer prefers a gamma transition. The In-111 page describes the nuclide that actually reaches the clinic.",
    ],
  },
  "Ir-192m1": {
    heading: "Ir-192m1 as the brief first step of iridium activation",
    paragraphs: [
      "Ir-192m1 is the state that a share of neutron captures on iridium populate first; it decays within a couple of minutes by isomeric transition into the Ir-192 ground state, so by the time a radiography or brachytherapy source is removed from the reactor and encapsulated it has entirely converted. Its gamma lines, listed on this page, are close to those of the ground state.",
      "The isomer is of interest in activation analysis and in the physics of iridium, where the spins of its states explain the branching of neutron capture; the shielding figures here resemble those of the ground state and have no separate practical use.",
      "A second, long-lived isomer of the same nucleus is a different matter and has its own page: Ir-192m2 persists for centuries and is the reason disused iridium sources never quite reach background.",
    ],
  },
  "Ir-192m2": {
    heading: "Ir-192m2 as the long tail of every iridium source",
    paragraphs: [
      "Ir-192m2 is a long-lived isomer formed in a tiny fraction of the neutron captures that make Ir-192 for radiography and brachytherapy. It decays by isomeric transition into the ground state over centuries, and because each transition produces an Ir-192 nucleus that then decays in its usual way, a disused iridium source continues to emit the familiar Ir-192 lines at a very low level long after the main activity has gone. That residual activity is what decides whether an old source can be cleared as ordinary waste.",
      "The photon table on this page lists the soft lines of the isomer's own transition with the iridium X-rays that follow; the shielding figure here is correspondingly thin. The equilibrium ground-state activity, which carries the harder lines, is not part of these figures and has to be taken from the Ir-192 page.",
      "Its activity in a fresh source is negligible, but a half-life of centuries means source manufacturers and waste managers account for it explicitly.",
    ],
  },
  "Kr-85m": {
    heading: "Kr-85m in reactor off-gas and fuel-leak detection",
    paragraphs: [
      "Kr-85m is a short-lived fission product noble gas that reaches the coolant and the off-gas of a reactor whenever fuel cladding is leaking, and its ratio to the longer-lived xenon isotopes tells operators how large the leak is and whether the fuel is still in the core. It decays within hours, mostly by beta emission to rubidium and partly by isomeric transition to Kr-85, so it is one of the sources of the long-lived krypton in reactor gas.",
      "Its two gamma lines, the pair in the table above, make it easy to measure in a gas sample with a spectrometer, and little lead is needed to halve them. A noble gas is not retained in the body; the dose from a release is external, from the cloud, and to the lung from the gas it contains.",
      "Off-gas systems hold it on charcoal beds for long enough to decay before discharge, which is the same strategy used for the xenon isotopes. It has no use outside the reactor.",
    ],
  },
  "Lu-177m": {
    heading: "Lu-177m as the long-lived by-product of direct Lu-177 production",
    paragraphs: [
      "Lu-177m is made alongside Lu-177 when natural or enriched lutetium is irradiated directly in a reactor, in a small fraction of captures, and it decays over months rather than days, mostly by beta emission and partly by isomeric transition to Lu-177. Its half-life of months means that the activity left in a hospital's drains, sinks and waste bins after radioligand therapy is eventually dominated by the isomer rather than by the therapeutic nuclide, and waste regulators have had to account for it.",
      "The photon table here runs long, with many lines of medium energy sharing the dose rate, and the shielding figure is modest. In a treatment the isomer is a minor contaminant; in the waste stream it is the long tail, which is why production from ytterbium, which yields no isomer, is preferred where cost allows.",
      "Its own emissions are of no therapeutic use, and it is never produced deliberately; the Lu-177 page describes the nuclide that the isomer accompanies.",
    ],
  },
  "Na-24m": {
    heading: "Na-24m as a millisecond state formed in neutron capture",
    paragraphs: [
      "Na-24m is an excited state of the Na-24 nucleus that lives for a few hundredths of a second and decays by gamma emission to the Na-24 ground state. Some of the neutron captures on sodium end in it, and its single gamma line, the whole of this page's photon table, is one of the prompt lines seen when sodium is irradiated. The evaluation lists the state with a measured half-life, which is why it has a page.",
      "No source of Na-24m can exist for longer than the blink of an eye, and the dose rate and shielding figures here describe photons per decay rather than anything that could be handled. The nuclide that persists, Na-24, has its own page and is the one that matters for coolant activity and criticality dosimetry.",
      "The state is of interest in the physics of neutron capture, where the branching between the isomer and the ground state is part of what determines the Na-24 yield from a given sodium sample.",
    ],
  },
  "Nb-95m": {
    heading: "Nb-95m as a side branch of the zirconium-niobium chain",
    paragraphs: [
      "Nb-95m is populated in a small fraction of the decays of the fission product Zr-95, and it decays over a few days, mostly by isomeric transition to Nb-95 and in a small share by beta emission to molybdenum. Its single prominent gamma line, which dominates the photon table on this page, appears in the spectrum of any sample that contains Zr-95 and is occasionally mistaken for a separate contaminant.",
      "A modest thickness of lead halves the line, and the isomer's contribution to the dose rate of a fission-product mixture is small; its practical importance is in gamma spectrometry, where its line is accounted for when the zirconium and niobium activities are extracted from a spectrum.",
      "It has no use outside that context and never appears in inventories on its own, since the ground state that it feeds carries the activity that matters. The Zr-95 and Nb-95 pages describe the pair that this isomer belongs to.",
    ],
  },
  "Re-188m": {
    heading: "Re-188m as the short-lived isomer of reactor-made rhenium",
    paragraphs: [
      "Re-188m arises in some of the captures when the heavier stable rhenium isotope absorbs a neutron, and it decays within minutes by isomeric transition to Re-188. It therefore appears in rhenium irradiated directly in a reactor, which is one route to the therapy nuclide, but not in Re-188 eluted from a tungsten generator, where the parent decays straight to the ground state. Its emissions are soft: a group of low-energy gamma lines and X-rays, as its table above shows.",
      "Lead a fraction of a millimetre thick halves its output, and the isomer has no handling consequences; its activity has converted to the ground state by the time any product is dispensed, and in activation analysis of rhenium its lines serve as a quick indicator of the element.",
      "Its page exists because the evaluation records it as a distinct state with a measured half-life, and because its lines can show up in the prompt spectrum of a freshly irradiated target. The Re-188 page describes the therapy nuclide.",
    ],
  },
  "Rh-106m": {
    heading: "Rh-106m as a fission-product isomer of the first hours",
    paragraphs: [
      "Rh-106m is formed directly in fission and decays over a couple of hours by beta emission to palladium, not into the short-lived Rh-106 ground state; the two are separate nuclides that happen to share a mass number. Its spectrum is rich, with many gamma lines of medium and high energy listed on this page, and it is among the nuclides that make the gamma field of very fresh fission products so intense.",
      "The photon table is long and the shielding figure here is substantial; a sample taken within hours of fission is a hard gamma source partly because of this isomer. It has gone within a day, leaving the Ru-106 and Rh-106 pair, with its year-long half-life, as the lasting ruthenium activity.",
      "It has no use and no inventory significance; its interest is in the first hours of a fission-product mixture and in nuclear structure. The Rh-106 page describes the nuclide of practical importance.",
    ],
  },
  "Sb-124m1": {
    heading: "Sb-124m1 as a seconds-long isomer of antimony",
    paragraphs: [
      "Sb-124m1 lives for about a minute and a half and decays mostly by isomeric transition to Sb-124, with a beta branch of its own, emitting the three gamma lines of medium energy that share the dose rate above. A share of neutron captures on the heavier stable antimony isotope lands in this state, and it is gone before an irradiated sample can be counted by anyone who is not standing beside the reactor.",
      "In neutron activation analysis of antimony the state is sometimes used with a pneumatic transfer system that delivers the sample to a detector within seconds, where its lines give a fast measure of the element; otherwise it is invisible. The shielding figures here resemble the ground state's and have no application.",
      "The isomer that persists from antimony activation is Sb-124 itself, whose page describes the photoneutron source and the activation of bearing alloys.",
    ],
  },
  "Sb-124m2": {
    heading: "Sb-124m2 as the longer antimony isomer with only X-rays to show",
    paragraphs: [
      "Sb-124m2 is the higher of the two short-lived isomers of Sb-124, living for a few tens of minutes before an isomeric transition that passes through the lower isomer on its way to the ground state. The transition itself is so highly converted that the one entry this page can show is the antimony X-ray line; everything else is electrons.",
      "Lead one hundredth of a millimetre thick halves that line, which is the shielding figure for X-rays and says nothing about the beta and gamma activity of the Sb-124 that the isomer feeds. In activation analysis the state can be used to measure antimony with a short irradiation and a count after a few minutes.",
      "No source of Sb-124m2 is handled on its own; its page completes the dataset's record of the antimony isomers, and the ground-state page carries the figures that matter for a real antimony source.",
    ],
  },
  "Sc-46m": {
    heading: "Sc-46m as the seconds-long precursor of Sc-46",
    paragraphs: [
      "Sc-46m receives part of the neutron captures on scandium and decays within seconds by isomeric transition to Sc-46, emitting one soft gamma line, which is all the table here contains. Its principal use is in neutron activation analysis, where a sample irradiated for a few seconds and counted at once gives a scandium result in under a minute; the longer-lived ground state is then used for a more precise measurement later.",
      "Lead halves its line within a fraction of a millimetre, and handling consequences are nil. In the preparation of Sc-46 tracers for sediment and reservoir studies the isomer has decayed before the material leaves the reactor.",
      "In nuclear physics the state is a clean example of a low-lying isomer whose lifetime is governed by the spin difference from the ground state, and its half-life is quoted in evaluations for that reason.",
    ],
  },
  "Sm-153m": {
    heading: "Sm-153m as a millisecond state in the samarium level scheme",
    paragraphs: [
      "Sm-153m is an excited state of the Sm-153 nucleus lasting a few hundredths of a second, which returns to the ground state by gamma emission. Neutron capture on samarium and the decay of nearby nuclei populate it, and the evaluation records its half-life, so it earns an entry here. A single soft line with samarium X-rays beside it makes up its photon table.",
      "Nothing on this page corresponds to a handleable source; a state that decays in milliseconds cannot be accumulated, and the dose rate and shielding figures describe photons per decay in the abstract. In practice its line is part of the prompt spectrum of irradiated samarium.",
      "The nuclide that matters, Sm-153, is the therapy nuclide for bone pain, and its own page carries the figures that a radiopharmacy uses.",
    ],
  },
  "Sn-113m": {
    heading: "Sn-113m as the short-lived isomer of tin activation",
    paragraphs: [
      "Sn-113m is formed when the lightest stable tin isotope captures a neutron into the isomeric state, and within minutes an isomeric transition takes it to Sn-113. Its emissions are almost entirely X-rays, which is what the table here consists of, and lead stops it within a hundredth of a millimetre. Activation analysis uses it to measure tin with a short irradiation and a prompt count, and it is otherwise never encountered.",
      "In the production of Sn-113 calibration sources the isomer has decayed before the material is processed, and in reactor circuits the tin activation seen in corrosion-product spectra is the longer-lived ground state.",
      "Its page exists for completeness of the evaluated data; the Sn-113 page describes the generator parent and calibration line that have practical use.",
    ],
  },
  "Sr-85m": {
    heading: "Sr-85m as the fast isomer used in strontium activation analysis",
    paragraphs: [
      "Sr-85m is populated in neutron captures on the lightest stable strontium isotope and in proton reactions on rubidium, and it decays within about an hour, mostly by isomeric transition to Sr-85 and partly by electron capture to rubidium. Its single prominent gamma line, which leads the photon table on this page, makes it the nuclide of choice for measuring strontium by short-irradiation activation analysis, where the ground state would take weeks to give a result.",
      "Lead halves the line within a millimetre or so, and the isomer's handling consequences are nil; it has turned into the ground state before any source is processed. In the production of Sr-85 tracers it is a prompt indicator of yield.",
      "The Sr-85 page describes the long-lived nuclide used as a yield monitor and calibration source, which is what remains after the isomer has decayed.",
    ],
  },
  "Ta-182m1": {
    heading: "Ta-182m1 as a sub-second state with nothing in the tables",
    paragraphs: [
      "Ta-182m1 is an excited state of the Ta-182 nucleus that lives for a fraction of a second, and this dataset records no photon line for it above the cutoff, so the page carries no emission tables at all, only the half-life and the specific activity. The state is populated in neutron capture on tantalum and decays by a highly converted transition to the ground state, which is why its radiation is electrons and X-rays rather than gamma lines.",
      "It cannot be handled, stored or measured as a source, and its entry here exists because the evaluation assigns it a half-life. The specific activity printed on the page is a mathematical consequence of that half-life and corresponds to nothing physical.",
      "The tantalum nuclide of practical importance is Ta-182 itself, with its months-long half-life and hard gamma spectrum, which the Ta-182 page describes; a second isomer with a half-life of minutes, Ta-182m2, has its own page.",
    ],
  },
  "Ta-182m2": {
    heading: "Ta-182m2 as the minutes-long tantalum isomer",
    paragraphs: [
      "Ta-182m2 takes a share of the neutron captures on tantalum and decays over a quarter of an hour by isomeric transition to Ta-182, emitting a cluster of soft gamma lines and X-rays that the table above lists. It is used in neutron activation analysis of tantalum when a fast result is wanted, and it appears in the prompt spectrum of any tantalum component that has just left a neutron field.",
      "The shielding figure is small and the isomer adds little to the dose rate of a freshly irradiated component, which is dominated by the hard lines of the ground state once that has built up. Within an hour of irradiation the isomer is gone.",
      "Its page completes the record of the tantalum isomers in the evaluated data; the Ta-182 page carries the figures for the nuclide that is actually handled.",
    ],
  },
  "Tl-201m": {
    heading: "Tl-201m as a millisecond state fed by lead decay",
    paragraphs: [
      "Tl-201m is an excited state of the Tl-201 nucleus with a half-life of a few thousandths of a second. It is populated when Pb-201 decays and in nuclear reactions on mercury and thallium, and it drops to the Tl-201 ground state through two gamma lines, both tabulated here. The evaluation gives it a half-life, so it has an entry; nothing about it can be handled as a source.",
      "Several millimetres of lead are needed to halve them because the lines are of medium energy, but the figure has no application; the state has decayed before any sample containing it could be moved. In the production of Tl-201 for heart imaging the isomer's lines appear in the prompt spectrum of the lead parent.",
      "The Tl-201 page describes the diagnostic nuclide that reaches the clinic, whose X-rays are what a gamma camera images.",
    ],
  },
  "U-238m": {
    heading: "U-238m as a nanosecond isomer of uranium",
    paragraphs: [
      "U-238m is an excited state of the U-238 nucleus that lives for a few hundred nanoseconds and sheds its energy as gamma rays on the way to the ground state, through the two high-energy lines that this page tabulates. Such states are reached in nuclear reactions and when adjacent nuclei decay, and they are studied because their lifetimes reveal how the nucleus is shaped and how its angular momentum is arranged; the evaluation gives the state a measured half-life, hence its entry here.",
      "The shielding figure here is among the largest on the site, since the lines are very energetic, but it describes photons that are emitted only during a nuclear physics experiment. No sample of U-238m exists for longer than the flight time of the beam that made it.",
      "The uranium nuclide that matters is U-238 itself, whose page describes the head of the uranium series, depleted uranium and the dating of the Earth.",
    ],
  },
  "Xe-133m": {
    heading: "Xe-133m as the isomer that tells fission from medicine",
    paragraphs: [
      "Xe-133m is the isomer of Xe-133 that lives for a couple of days and falls by isomeric transition to the ground state. It is a fission product in its own right, and its ratio to Xe-133 and to the other radioxenon isotopes is what allows the global monitoring network for nuclear tests to tell a fresh fission event from the routine releases of medical isotope production plants, whose xenon has a different isotopic signature.",
      "Its emissions are soft, as the photon table shows: caesium X-rays and one modest gamma line, with a lead half-value layer figure of a few hundredths of a millimetre. It is measured in air samples by beta-gamma coincidence counting after the xenon has been separated from the air, at concentrations far below any protection concern.",
      "Xenon is not retained by the body, and in reactor off-gas it is held on charcoal with the other xenon isotopes until it has decayed. It has no use of its own.",
    ],
  },
  "Y-88m1": {
    heading: "Y-88m1 as a sub-millisecond state of yttrium",
    paragraphs: [
      "Y-88m1 is an excited state of the Y-88 nucleus whose life is a fraction of a millisecond and de-excites by gamma emission through the single line tabulated here. Reactions on strontium and the decay of zirconium populate it, and the evaluation records a half-life for it, which is the only reason it appears here.",
      "No source of this state can be prepared or shielded; the dose rate and shielding figures refer to photons per decay of an entity that is gone within the time light takes to cross a room. In the production of Y-88 calibration sources its line appears only in the prompt spectrum of the target.",
      "The Y-88 page describes the nuclide of practical use, a high-energy calibration source and photoneutron source with a half-life of months.",
    ],
  },
  "Y-88m2": {
    heading: "Y-88m2 as a second isomeric state of yttrium",
    paragraphs: [
      "Y-88m2 is a higher excited state of Y-88 with a half-life of a few hundredths of a second, decaying by gamma emission through the two lines tabulated here to lower states and then to the ground state. It is reached in nuclear reactions and is listed in the evaluated data with a measured lifetime; like its lower neighbour it has no existence as a handleable source.",
      "The figures on the page are those of its two lines and are of interest to spectroscopists who identify the state by them; the lead half-value layer figure has no application. In practice both isomers are simply part of the prompt radiation from a target in which Y-88 is being made.",
      "Readers who have arrived here looking for a yttrium source should turn to the Y-88 page, or to Y-90 for the therapy nuclide.",
    ],
  },
  "Y-90m": {
    heading: "Y-90m in reactor-made yttrium and activation analysis",
    paragraphs: [
      "A small fraction of neutron captures on stable yttrium produce Y-90m, as do neutron reactions on zirconium, and it decays within a few hours by isomeric transition to Y-90, with a negligible beta branch. Its two gamma lines, tabulated above, make it the nuclide used to measure yttrium by activation analysis, and they appear in the prompt spectrum of any yttrium-bearing material taken from a reactor.",
      "Lead halves the field within a couple of millimetres. The isomer is absent from Y-90 obtained from a Sr-90 generator, which is how the therapy nuclide is normally supplied, so a radiopharmacy never sees it; it is present only in yttrium irradiated directly.",
      "Its handling consequences are nil beyond the first day, after which the sample is a pure Y-90 beta source, and the Y-90 page describes that nuclide.",
    ],
  },
};

export const NOTE_KEYS = Object.keys(NUCLIDE_NOTES);
