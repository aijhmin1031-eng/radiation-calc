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
}

export const NUCLIDE_NOTES: Record<string, NuclideNote> = {
  "Am-241": {
    heading: "Am-241 in smoke detectors, gauges and neutron sources",
    paragraphs: [
      "Am-241 is the alpha emitter inside ionisation-chamber smoke detectors, where a few tens of kilobecquerels ionise the air gap and a smoke particle changes the current. It is also the excitation source in portable X-ray fluorescence analysers, the gamma source in some density and thickness gauges, and, mixed with beryllium, the alpha emitter of AmBe neutron sources used in well logging and moisture gauges. In aged plutonium it grows in from the decay of Pu-241, which is why old plutonium is more radioactive at the surface than fresh material.",
      "The external hazard is governed by one low-energy photon line that the table below shows carrying most of the dose rate, with the remainder from a still softer line. A line that soft is absorbed by the source capsule, by a few millimetres of steel and by the first layer of lead, so a shielded source can read almost nothing on a dose rate meter while the activity inside is substantial. The intake hazard is the opposite case: once inhaled or ingested, the alpha energy is delivered to bone surfaces and liver, and the dose coefficient per becquerel is among the highest of the common nuclides.",
      "When reading this page, treat the half-value layer in lead as a statement about the photon, not about the source: a smoke-detector foil in its holder is already effectively shielded, whereas a bare AmBe source adds a neutron field that no photon figure here describes.",
    ],
  },
  "Co-60": {
    heading: "Co-60 in irradiators, radiography and calibration fields",
    paragraphs: [
      "Co-60 is produced by neutron activation of natural cobalt and is the radionuclide behind industrial gamma irradiators for medical-device sterilisation and food treatment, behind gamma radiography of thick steel, and, in regions where it is still in service, behind cobalt teletherapy units. Secondary standard calibration fields for dose rate instruments are commonly realised with Co-60 alongside Cs-137 because its two high-energy photons give a well-defined, penetrating field.",
      "The same activation route makes Co-60 the dominant external dose contributor during the first decades of reactor decommissioning: cobalt is a trace constituent of stainless steels and hard-facing alloys, and every component that saw a neutron flux carries it. Its half-life, visible in the decay table below, is short enough that storage for a few decades removes most of it, and long enough that irradiator sources need regular top-up to hold their throughput.",
      "The two photon lines are close in energy and both penetrating, so the shielding table here is unusually representative: the half-value layer in lead or concrete applies to the whole spectrum rather than to one line. The figure to remember from the limits section is the dose rate at a metre from a gigabecquerel, because irradiator loadings are measured in petabecquerels.",
    ],
  },
  "Cs-137": {
    heading: "Cs-137 as a calibration source, a gauge source and a contaminant",
    paragraphs: [
      "Cs-137 is a fission product, and it reaches the field in two very different forms. As a sealed source it is the reference nuclide for dose rate calibration, the source in level and density gauges, and the former source in blood irradiators that are now being replaced. As a contaminant it is the long-lived signature of weapons fallout and of the Chernobyl and Fukushima releases, and it is the nuclide most often found when food, soil or scrap metal is screened.",
      "The photon that defines Cs-137 is not emitted by Cs-137 at all. The decay feeds the metastable Ba-137m, which reaches equilibrium with its parent within minutes and emits the line that dominates the table below, the other entries being barium X-rays; a gamma spectrum of a caesium source is therefore a barium spectrum. Chemically, caesium chloride is a soluble, dispersible powder, which is why orphaned sources have caused contamination incidents out of proportion to their activity.",
      "For shielding, the single line makes the half- and tenth-value layers on this page directly usable, and the ratio between them is close to the single-energy value. For environmental work the relevant quantity is not the dose rate at a metre but the activity concentration, and the decay table is the tool for projecting how long a contaminated site remains above a clearance level.",
    ],
  },
  "Na-22": {
    heading: "Na-22 as a long-lived positron reference",
    paragraphs: [
      "Na-22 is a positron emitter with a half-life of years rather than minutes, and that combination is its whole value. Positron emission tomography (PET) scanners, coincidence counters and well counters are checked with Na-22 point or rod sources because the annihilation photons are the same ones the instruments are built to detect, while the activity stays usable for years. In materials science it is the standard positron source for positron annihilation lifetime spectroscopy, where the prompt gamma that follows each decay provides the start signal.",
      "Each decay produces the pair of annihilation photons plus a higher-energy gamma, and the table below shows how the dose rate divides between them. The annihilation photons are only produced where the positron stops, which is within the source encapsulation or the first millimetre of surrounding material; an unencapsulated Na-22 deposit behaves differently from a sealed one.",
      "Sources are usually small, and the handling question is contamination rather than external dose. The half-life, shown in the decay table, means a source bought for a scanner acceptance test is still usable at the next one, which is the practical reason it is specified over F-18 for anything that is not a patient study.",
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
    ],
  },
  "Ni-63": {
    heading: "Ni-63 in electron capture detectors and activated steel",
    paragraphs: [
      "Ni-63 emits a very low-energy beta and nothing else, and that is why it sits inside the electron capture detector of a gas chromatograph: the betas ionise the carrier gas, and electronegative analytes reduce the standing current. The same property makes it the preferred isotope for betavoltaic batteries, and the long half-life recorded in the decay table below is what gives those detectors and batteries their service life.",
      "In reactor steels Ni-63 is an activation product of natural nickel, alongside the longer-lived Ni-59, and it is one of the hard-to-measure nuclides in decommissioning characterisation. There is no photon to find it with, so it is inferred from scaling factors against Co-60 or determined radiochemically and counted by liquid scintillation.",
      "A sealed Ni-63 source reads next to nothing on a Geiger–Müller probe through its window, and that absence is not evidence of a leak-free source: a swipe counted by liquid scintillation is the only check that works. The beta range table on this page shows how little material stops the emission, which is the same fact seen from the other side.",
    ],
  },
  "Ba-133": {
    heading: "Ba-133 as a multi-line calibration source and an iodine stand-in",
    paragraphs: [
      "Ba-133 decays by electron capture and emits a group of photon lines spread across the low and medium energy range, which is why it appears in almost every gamma spectrometry calibration set. Its lines bracket those of I-131, and sealed Ba-133 standards are used as a long-lived stand-in for I-131 when thyroid uptake probes and dose calibrators are checked, since a true I-131 standard would decay within weeks.",
      "The spread of energies is also what the shielding table below reflects: the half-value layer is set by the harder lines and the tenth-value layer by them even more so, so the ratio between the two departs from the single-energy value. Barium X-rays from the electron capture add to the low-energy end of any spectrum.",
      "The decay table shows a half-life long enough for one calibration source to outlive several instruments. Coincidence summing is noticeable when a Ba-133 source is counted close to a detector, because several lines are emitted in cascade; an efficiency curve built from close-geometry Ba-133 points without correction will be biased.",
    ],
  },
  "Ir-192": {
    heading: "Ir-192 in industrial radiography and high-dose-rate brachytherapy",
    paragraphs: [
      "Ir-192 is produced by neutron activation of natural iridium and is the standard source for gamma radiography of welds in pipelines, pressure vessels and structural steel, where its spectrum gives usable contrast on medium steel thicknesses with a source small enough to fit a projector. In medicine the same nuclide, in a miniature stepping source, delivers high-dose-rate brachytherapy. In both uses the activity is high, the source is moved remotely, and the recorded accidents involve a source that did not return to its shield.",
      "The spectrum consists of many lines in the middle energy range, listed in the table below with their share of the dose rate, and the shielding table reflects that spread. The half-life is short enough, as the decay table shows, that a radiography source is exchanged several times a year, which is itself a transport and handling operation.",
      "The limits section gives the dose rate at a metre for a bare source, which is the number a radiographer uses to set a controlled area. In a projector the collimator and the depleted uranium or tungsten shield reduce it by orders of magnitude; the figure applies the moment the source leaves the guide tube.",
    ],
  },
  "Sr-90": {
    heading: "Sr-90 with its daughter Y-90 in gauges, applicators and waste",
    paragraphs: [
      "Sr-90 is a fission product and a pure beta emitter, but almost nothing about a Sr-90 source is set by its own beta. Its daughter Y-90 reaches equilibrium within weeks and emits a far more energetic beta, so a Sr-90 source is in practice a Y-90 source with a long half-life. That pairing is used in thickness gauges for paper and plastic film, in ophthalmic applicators, and historically in radioisotope thermoelectric generators left at remote sites.",
      "The beta energy of the daughter brings the bremsstrahlung question: the fraction of beta energy converted to X-rays rises with the atomic number of the absorber, so shielding is acrylic first and lead, if needed, outside it. For intake the concern is that strontium follows calcium into bone, where the long half-life in the decay table means the activity stays for the rest of life.",
      "Detection is direct with a thin-window Geiger–Müller probe because of the Y-90 beta, which is also why Sr-90 is the usual beta calibration source for contamination monitors. The range and bremsstrahlung figures on this page are for the beta of Sr-90 itself. The Y-90 beta has a far higher endpoint and travels several times further in any absorber, so for a source in equilibrium the Y-90 page is the one to read for shielding.",
    ],
  },
  "C-14": {
    heading: "C-14 in tracer studies, dating and reactor graphite",
    paragraphs: [
      "C-14 is a soft, pure beta emitter with a half-life measured in thousands of years, and the two facts explain both of its roles. In the life sciences it labels organic molecules for metabolism and drug-disposition studies, where the long half-life means the label does not change during an experiment. In archaeology and geology the cosmogenic C-14 in once-living material is the clock of radiocarbon dating.",
      "In the nuclear fuel cycle it is an activation product of nitrogen impurities and of oxygen, and reactor graphite and some steels carry inventories that dominate the long-term inventory of a decommissioning waste stream. It has no photon, so it is measured by liquid scintillation after combustion or by accelerator mass spectrometry.",
      "A Geiger–Müller probe responds weakly to C-14 through its window and not at all through a glove, so contamination control depends on swipes and counting. The beta range table below shows the thickness that stops the emission entirely; for shielding purposes the question does not arise, and the issue in handling is volatile carbon dioxide from acidified solutions.",
    ],
  },
  "I-131": {
    heading: "I-131 in thyroid therapy, waste decay and effluent monitoring",
    paragraphs: [
      "I-131 is a fission product used therapeutically because the thyroid concentrates iodine: administered as iodide, it treats hyperthyroidism and ablates thyroid tissue after cancer surgery. It emits both a beta, which delivers the therapeutic dose locally, and photons, listed below, which make the patient a measurable external source and allow the uptake to be imaged.",
      "The decay table sets the clinical logistics: short enough that ward waste is held for decay rather than shipped, long enough that a treated patient carries measurable activity home. Patient release rules, the handling of excreta and the monitoring of hospital effluent all follow from that balance. Elemental iodine is volatile, so iodide solutions are handled in a fume cupboard and the worker's own thyroid is monitored.",
      "In gamma spectrometry the principal line is distinctive and is one of the first peaks sought after a reactor release, where its short half-life makes it the marker of a recent event. The shielding table here gives the layers for the photon component; the beta is stopped by the first few millimetres of any material and does not reach a person at a distance.",
    ],
  },
  "Pu-239": {
    heading: "Pu-239 as fissile material and as an intake hazard",
    paragraphs: [
      "Pu-239 is the fissile isotope bred from U-238 in reactors, present in spent fuel, recycled in mixed-oxide fuel and accounted for under international safeguards. In radiation protection it is an alpha emitter whose photons are weak, as the table below makes plain: the external dose rate from plutonium is small, and the hazard is almost entirely the inhalation of fine oxide particles, which deposit the alpha energy in lung, liver and bone over a lifetime.",
      "The weak photon emission is also what makes measurement difficult. Plutonium in a glovebox or a container is assayed from its low-energy X-rays and gammas with high-resolution detectors, from neutrons emitted in spontaneous fission and in alpha-neutron reactions on light elements, or, for aged material, from the Am-241 that has grown in from Pu-241. Alpha spectrometry and mass spectrometry are the laboratory methods.",
      "The decay table on this page spans a half-life long enough that no storage period reduces the inventory, which is why plutonium-bearing waste is a geological disposal question. The limits section states the consequence directly: for this nuclide the controlling dose is internal, and the figures above do not describe it.",
    ],
  },
  "Eu-152": {
    heading: "Eu-152 for detector efficiency calibration and in activated concrete",
    paragraphs: [
      "Eu-152 emits photon lines from the low-energy region to well above a megaelectronvolt, and that spread makes it the single most useful source for building the efficiency curve of a gamma spectrometer across its working range. Its half-life, shown in the decay table below, keeps a calibration source serviceable for a decade or more.",
      "The same richness of lines is a trap at close geometry: several lines are emitted in cascade, and coincidence summing removes counts from one peak and adds them to a sum peak. An efficiency curve taken with the source on the detector cap will be wrong unless summing corrections are applied or the source is counted at a distance.",
      "Eu-152 is also an activation product of the trace europium in concrete aggregates and in some control-rod materials, so it appears, with Eu-154, in the bioshield concrete of decommissioned reactors and sets part of the dose rate during dismantling. The shielding table here gives layers for the whole spectrum, dominated by the harder lines.",
    ],
  },
  "Kr-85": {
    heading: "Kr-85 as a noble-gas beta source and a reprocessing tracer",
    paragraphs: [
      "Kr-85 is a radioactive noble gas, chemically inert and therefore useful where a source must not react or be absorbed: thickness gauges for thin films and paper, leak testing of sealed components, and the starting aid in some discharge lamps. It is also a fission product released to the atmosphere when spent fuel is dissolved, and its global atmospheric concentration is a record of reprocessing activity.",
      "The decay is almost entirely beta. The one photon line in the table below accompanies fewer than one decay in a hundred; the share column divides the photon dose rate among the lines and so gives it everything, and it is the dose rate per gigabecquerel in the figures table that shows how small that photon component is. An inert gas is not taken up by the body, so the dose from a release is external, to the skin and from immersion in the plume, rather than from intake; measurement in air uses flow-through counters or gas sampling followed by counting.",
      "A Kr-85 gauge source is a sealed volume of gas, and the leak test that matters is for the gas itself. A gauge serves for years on one filling, as the decay table shows, and the range table shows how little material stops the beta, which is the property the gauge exploits.",
    ],
  },
  "Po-210": {
    heading: "Po-210 in static eliminators and in the natural radium chain",
    paragraphs: [
      "Po-210 is an alpha emitter with a half-life of months, found in static eliminator brushes and bars that neutralise charge on film, lenses and powders, and formerly used as a compact heat source. It is also the last radioactive member of the uranium series, which is why it is present in tobacco smoke, in seafood and in the environment generally.",
      "The alpha has no range outside the source, and this page lists no photon line at all: the one weak gamma of Po-210 accompanies so few decays that it does not appear in the dataset the page is built from, and a sealed source reads nothing on an ordinary dose rate meter. The hazard is intake: the alpha energy delivered per becquerel ingested or inhaled is very high, and Po-210 is among the most radiotoxic nuclides in common use.",
      "The short half-life, in the decay table, means static eliminators are replaced on a yearly cycle and that waste decays within a few years. Measurement is by alpha spectrometry after chemical separation, or, for surface contamination, by alpha-sensitive probes held close to the surface because the particles do not travel.",
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
      "Cs-134 is not a direct fission product in significant yield; it is formed when the stable Cs-133 produced in fuel captures a neutron. Its presence therefore indicates irradiated fuel rather than a weapons source, and the ratio of Cs-134 to Cs-137 in a sample, corrected for decay, dates the release and distinguishes one accident's contamination from another's.",
      "It emits several photon lines, listed in the table below, and its spectrometry carries the same coincidence-summing caution as Eu-152 and Ba-133: counted close to a detector, the cascade lines sum and the apparent activity is biased. Set against Cs-137 the half-life is short, as the two decay tables show, so Cs-134 fades from a contaminated area within a decade while Cs-137 remains.",
      "For shielding the spectrum is harder than that of Cs-137, and the half-value layer below is correspondingly larger. In food and soil screening shortly after a release the two caesium isotopes are reported together, and their ratio is the quantity that checks whether the measurement is consistent with the event it is attributed to.",
    ],
  },
  "Ra-226": {
    heading: "Ra-226 in legacy sources, radon and naturally occurring material",
    paragraphs: [
      "Ra-226 is the historical radionuclide: luminous paint, early brachytherapy needles and the original definition of the curie all come from it, and disused radium sources still surface in hospitals, schools and scrap. It is also the parent of radon, and radium accumulated in oil-field scale, water-treatment residues and phosphate by-products is the usual reason a material is classed as naturally occurring radioactive material (NORM).",
      "The photon table below lists the lines of Ra-226 alone, and the dose rate figures follow from them. In a sealed source that has reached equilibrium, almost all of the photon dose rate comes instead from the short-lived progeny of radon, Pb-214 and Bi-214, which this page does not include, so a radium source in equilibrium reads far higher than the figures here suggest. A freshly separated sample, or a leaking source that lets radon escape, reads lower than the same activity sealed; gamma spectrometry of environmental samples waits for that equilibrium before counting.",
      "Nothing in the decay table happens on a human scale, so radium waste does not decay away in storage. Old sources are frequently found leaking, and the escaping radon rather than the external photon dose is the hazard that a survey must look for.",
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
    ],
  },
  "F-18": {
    heading: "F-18 as the working nuclide of positron emission tomography",
    paragraphs: [
      "F-18 is the radionuclide of most positron emission tomography (PET) studies, usually as fluorodeoxyglucose. It is produced in a cyclotron, incorporated into the tracer within hours and administered the same day; the decay table below shows why delivery schedules, patient throughput and staff rotas in a PET department are all built around its half-life.",
      "Each decay ends in two annihilation photons emitted in opposite directions, which is what the scanner detects and also what makes a dosed patient a penetrating source. The shielding table reflects photons harder than those of most diagnostic nuclides: syringe shields are thick tungsten rather than thin lead, and the extremity dose to the technologist drawing the dose is the limiting quantity in many departments.",
      "Waste decays to background overnight, so the handling problem is short-term external dose rather than disposal. The metre dose rate in the limits section is the number behind the distance and time rules for staff near a freshly injected patient.",
    ],
  },
  "Tc-99m": {
    heading: "Tc-99m from the generator to the gamma camera",
    paragraphs: [
      "Tc-99m is the most widely used diagnostic radionuclide. It is eluted on site from a generator loaded with its parent Mo-99, bound to one of many kit preparations, and imaged with a gamma camera whose collimators and crystals are designed around its one gamma line. The decay table below shows a half-life long enough to prepare, inject and image, and short enough to keep the patient's dose low.",
      "Quality control of the eluate includes a check for Mo-99 breakthrough, because the parent emits harder photons and would both degrade the image and add dose. The daughter of Tc-99m is the long-lived Tc-99, present in every used vial and in patient excreta, but at an activity so small that it is a disposal accounting matter rather than a dose question.",
      "Radiopharmacy shielding is lead glass and thin lead, consistent with the half-value layer on this page, and departmental waste is held for decay for a few days. Flood-source uniformity tests for the camera are done with Co-57, whose photon is close to this one and whose half-life is long.",
    ],
  },
  "I-125": {
    heading: "I-125 in brachytherapy seeds and in vitro assays",
    paragraphs: [
      "I-125 decays by electron capture and emits only low-energy photons, as the table below shows. That softness is why it is used in permanent prostate brachytherapy seeds, where the dose falls off within centimetres of the implant and the patient is not a significant external source, and why it was for decades the label of choice in radioimmunoassay, where the photons are counted efficiently in a well detector.",
      "The same softness means that thin lead stops it, that a Geiger–Müller probe with a thick window misses it, and that a thin-window sodium iodide scintillator is the right survey instrument. Like other iodine isotopes it concentrates in the thyroid, so laboratory workers who iodinate proteins are monitored by thyroid counting, and the volatility of iodine means the iodination itself is done in a fume cupboard.",
      "A half-life of a couple of months, as the decay table shows, suits the dose profile of a permanent implant and lets assay waste decay in storage within a year or two. The shielding figures on this page are among the smallest on the site and should be read in that light.",
    ],
  },
  "Se-75": {
    heading: "Se-75 for radiography of thinner steel sections",
    paragraphs: [
      "Se-75 is the alternative to Ir-192 in industrial radiography when the steel is thinner or the geometry is confined. Its photon spectrum, listed below, is softer than that of Ir-192, which gives better contrast on thin sections and allows a smaller projector shield for the same activity, and because it decays more slowly, as a comparison of the two decay tables shows, a source is exchanged less often.",
      "The source is produced by neutron activation of enriched selenium, and the chemistry of selenium, which is volatile at elevated temperature, is a constraint on source fabrication and on what happens to a source in a fire. In the field the handling rules are those of radiography generally: a high-activity source moved remotely, with the controlled area set from the figure at a metre in the limits section.",
      "The shielding table here is representative of the whole spectrum, and the tenth-value layer in lead is the figure that sizes a transport container. Because the photons are softer than those of Ir-192, scatter from the object under inspection is a larger fraction of the dose at the operator's position than the narrow-beam figures suggest.",
    ],
  },
  "Cf-252": {
    heading: "Cf-252 as a neutron source beyond the figures on this page",
    paragraphs: [
      "Cf-252 decays mainly by alpha emission, but a small branch undergoes spontaneous fission, and each fission releases several neutrons. That makes it the compact neutron source of choice for reactor start-up, for neutron radiography and activation analysis, for prompt-gamma analysis of bulk materials such as cement and coal, and for calibrating neutron instruments. A source stays useful for a few years, as the decay table below shows.",
      "This page shows no photon line and no dose rate, because the dataset records the alpha decay and not the prompt gammas of fission or the neutrons. The neutron field is the dominant external hazard, and nothing in the figures or the limits section describes it. Neutron shielding is a different problem: hydrogenous material to slow the neutrons, a boron or lithium absorber to capture them, and then lead for the capture gammas.",
      "Measurement around a Cf-252 source needs a neutron rem meter or an equivalent instrument; a photon dose rate meter reads a small fraction of the total. The fission fragments and the alpha stay inside the capsule, so intake is a concern only for a breached source.",
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
      "Cm-244 is the curium isotope that matters most in the fuel cycle. It is built up by successive captures on plutonium and americium, so its inventory rises steeply with burn-up, and its spontaneous-fission neutrons dominate the neutron emission of spent fuel after the short-lived Cm-242 has decayed. Neutron shielding of casks and hot cells is sized for it, and passive neutron assay of waste drums often amounts to measuring their Cm-244.",
      "The page shows a short photon table dominated by a soft line, and the lead half-value layer is correspondingly tiny; that is the photon story only. A gram quantity of Cm-244 is a strong neutron source, and the figures on this page say nothing about it. It is also a heat source, which is why it was once considered for radioisotope power.",
      "A couple of decades is the half-life the decay table gives, so curium-driven neutron output in storage halves within a working career while the plutonium daughter, Pu-240, remains. Intake limits are among the strictest, as for all alpha-emitting actinides.",
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
      "Pu-238 is the isotope made deliberately, by irradiating Np-237, for radioisotope thermoelectric generators: its alpha decay releases heat at a rate per gram high enough to power deep-space probes for decades, and the same property once powered implanted cardiac pacemakers. In the fuel cycle it also appears as a by-product, growing in from Cm-242 and raising the heat output and the alpha activity of recycled plutonium.",
      "The photon table on this page is short and soft, and the lead half-value layer is a fraction of a millimetre; externally a sealed Pu-238 heat source is quiet apart from the neutrons from alpha reactions on light impurities and from its small spontaneous-fission branch. Oxide fuel for power sources is made with oxygen depleted in the heavier isotopes to reduce that neutron output.",
      "The half-life in the decay table falls within a human lifetime, which sets both the useful life of a generator and the decay-storage prospects of contaminated material. Intake is the controlling hazard: fine oxide particles deposited in the lung deliver alpha energy for years.",
    ],
  },
  "Pu-240": {
    heading: "Pu-240 as the isotope that defines plutonium grade",
    paragraphs: [
      "Pu-240 is formed by neutron capture on Pu-239 and its fraction grows with burn-up, which is why the Pu-240 content separates weapons-grade from reactor-grade plutonium. It has a large spontaneous-fission branch for its mass, so its neutrons are what passive neutron assay of plutonium measures and what a coincidence counter is calibrated against, and they are also the reason reactor-grade material is harder to handle in bulk.",
      "The page shows two soft photon lines and a very thin half-value layer, which describes the photon field honestly and the external field badly: a kilogram of reactor-grade plutonium is primarily a neutron source, and the figures here do not include that. Its gamma lines at higher energy, used in isotopic analysis, are too weak to appear.",
      "Over millennia, the span the decay table covers, Pu-240 remains a permanent part of the plutonium inventory, and its alpha decay feeds U-236. Intake, not external dose, governs protection, with the lung the critical organ for inhaled oxide.",
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
      "Ra-224 is the daughter of Th-228 in the thorium series, and it is the radium isotope that a thorium-bearing material emits as thoron, the short-lived radon isotope of that series, rather than the familiar radon of the uranium series. It was once injected as a treatment for bone disease, is still the parent of Pb-212 generators used in targeted alpha therapy research, and appears in the characterisation of thorium ores, gas mantles and welding electrodes.",
      "For Ra-224 this dataset has no photon line, and only the alpha lines appear. In practice a weak gamma line exists and, more importantly, the daughters that grow in within hours, especially Pb-212 and Tl-208, emit strong lines that dominate any gamma spectrum of a thorium-series sample. The external dose from such a sample is a daughter story.",
      "A half-life of days means Ra-224 cannot be stockpiled, and a Ra-224 source is in practice a Th-228 source in equilibrium. Intake governs protection, as for all radium, with the thoron progeny adding an inhalation component in enclosed spaces.",
    ],
  },
  "Ra-228": {
    heading: "Ra-228 as the beta-emitting radium of thorium ores and scale",
    paragraphs: [
      "Ra-228 is the first long-lived daughter of Th-232 and the member of the thorium series that regulators and geochemists measure to characterise thorium-bearing materials: monazite sands, oil-field scale, water-treatment residues and some fertilisers. Unlike Ra-226 it is a beta emitter, and its activity in a water sample is a marker for thorium-series input as opposed to uranium-series input.",
      "The dataset behind this page records neither a photon line nor a beta spectrum for Ra-228, so the figures table carries only the half-life and specific activity and the page has no shielding or range sections. That reflects the nuclide's very soft beta and negligible gamma; in practice Ra-228 is determined through its daughter Ac-228, whose strong gamma lines appear once equilibrium is reached within days, or by beta counting after chemical separation.",
      "Its half-life of a few years, in the decay table, means that a radium-bearing scale sample changes character over a decade: the Ra-228 decays while the longer-lived Ra-226 remains. The intake hazard is that of radium generally, with deposition in bone.",
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
      "Th-232 is the primordial parent of the thorium series and the most abundant actinide in the crust after uranium. It is the fertile material of the thorium fuel cycle, breeding U-233 under neutron irradiation, and it is met in practice through its minerals and products: monazite sand, thoriated tungsten welding electrodes, old gas mantles and optical glass, and the residues of rare-earth processing.",
      "The page shows a few soft photon lines and an alpha table; the figures describe pure thorium, which reads very little. A natural thorium material in equilibrium is a different source entirely, because the chain through Ra-228, Th-228 and Tl-208 adds beta and penetrating gamma emission, and that is what a survey meter sees on a bag of monazite.",
      "With a half-life comparable to the age of the universe, as the decay table shows, Th-232's own activity per gram is small and its hazard arises from the progeny and from intake of thorium dust, which deposits on bone surfaces and in the lung. Thoron from the chain is a concern in enclosed thorium stores.",
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
      "U-234 is a daughter of U-238 a few steps down the chain, and although it makes up only a tiny fraction of natural uranium by mass, it is in equilibrium with U-238 in undisturbed ore and therefore carries as much activity as the parent. Enrichment concentrates it along with U-235, so enriched uranium is more radioactive per gram than natural uranium largely because of its U-234 content.",
      "This page carries a few soft lines and a lead layer measured in fractions of a millimetre; the external field from uranium metal or oxide is dominated by the beta-emitting daughters of U-238 and by the U-235 line rather than by U-234. In groundwater the ratio of U-234 to U-238 departs from equilibrium because recoil during decay ejects U-234 atoms from mineral grains, and that ratio is a tracer of water-rock interaction.",
      "Its half-life runs to a few hundred millennia and U-234 is effectively permanent. The limits section rightly points to intake, which for uranium combines a radiological dose with chemical toxicity to the kidney.",
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
      "U-236 is formed when U-235 captures a neutron without fissioning, so it is present in any uranium that has been through a reactor and essentially absent from natural uranium. That makes it the fingerprint of recycled uranium: its presence in a sample proves irradiation, and its ratio to U-238 is a tracer for reprocessing releases in the environment, measured by accelerator mass spectrometry at extraordinarily low levels.",
      "Only alpha lines appear on this page; the gamma emission is negligible, and U-236 is never seen by a survey meter and rarely by a spectrometer, and its radiological contribution to recycled uranium fuel is small. Its practical cost is as a neutron absorber in the reactor, which is why recycled uranium is enriched slightly higher to compensate.",
      "Its half-life is tens of millions of years, so it is permanent on any scale that matters, and its alpha decay feeds Th-232. Intake governs protection as for all uranium isotopes.",
    ],
  },
  "U-238": {
    heading: "U-238 as the bulk of uranium and the head of its series",
    paragraphs: [
      "U-238 is almost all of natural uranium by mass, the fertile isotope that breeds Pu-239 in reactors, and the head of the uranium series that ends in Pb-206 by way of Ra-226 and radon. Depleted uranium, the leftover of enrichment, is nearly pure U-238 and is used for shielding, counterweights and penetrators. Its half-life, in the decay table, is of the same order as the age of the Earth, which is what makes uranium-lead dating possible.",
      "The photon lines on this page are few and soft, and a bare piece of U-238 metal reads chiefly through the beta emission of its first daughters, Th-234 and Pa-234m, which reach equilibrium within months and are not represented here. The figures therefore describe freshly separated U-238 and understate aged metal.",
      "Intake governs the radiological hazard, and for soluble forms the kidney's chemical sensitivity to uranium is often the limiting factor. Radon from the chain is the dominant public exposure in many regions, but it is a product of the Ra-226 far down the chain rather than of U-238 itself.",
    ],
  },
  "Pb-210": {
    heading: "Pb-210 as the long-lived marker at the end of the radon chain",
    paragraphs: [
      "Pb-210 is the long-lived nuclide that the uranium series leaves behind after radon: airborne radon decays through a few short-lived steps to Pb-210, which settles onto soil, sediments, snow and the inside of pipes, and then decays over decades through Bi-210 to Po-210. Its steady deposition from the atmosphere makes it the standard chronometer for dating recent sediments and ice, and its build-up in oil and gas equipment is a recognised NORM problem.",
      "The page shows one soft photon line, a very soft beta and a thin half-value layer, and all three are hard to see in practice; Pb-210 is measured through its soft gamma with a thin-window detector, by beta counting of the Bi-210 daughter after ingrowth, or by alpha counting of the Po-210 that follows. The figures understate a source in equilibrium, whose energetic Bi-210 beta and Po-210 alpha carry most of the emitted energy.",
      "Intake is the concern, with lead deposited in bone and the polonium daughter formed inside the body; this is also the route by which tobacco delivers Pb-210 and Po-210 to the lung.",
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
      "Cd-109 decays by electron capture to a short-lived state of silver, and almost everything it emits is silver X-rays, with a modest gamma line above them. That spectrum made it the standard excitation source of portable X-ray fluorescence analysers for a generation: the silver X-rays excite the characteristic lines of elements from the transition metals up to tin, so a Cd-109 analyser identifies alloys, lead in paint and metals in soil. It is also used in thickness and coating gauges and as a low-energy calibration point for spectrometers.",
      "The photon table on this page is dominated by lines so soft that the lead half-value layer is a hundredth of a millimetre; a source capsule and a thin steel shutter are already full shielding, and the external dose rate from a working source is modest. The silver daughter is in equilibrium instantly and is part of the same spectrum.",
      "The half-life of a little over a year sets the replacement cycle for analyser sources, which is why many instruments have moved to miniature X-ray tubes. Disused Cd-109 sources decay to background within a decade.",
    ],
  },
  "Ce-139": {
    heading: "Ce-139 as a low-energy calibration line",
    paragraphs: [
      "Ce-139 is a calibration nuclide. It decays by electron capture, and its single prominent gamma line sits in the region between the X-ray calibration points and the medium-energy lines of Cs-137 and Co-60, which is exactly where the efficiency curve of a gamma spectrometer needs an anchor. For that reason it is included in most mixed-nuclide calibration standards, and it is one of the lines used to check the energy scale of detectors that work in the low-energy region.",
      "The photon table here shows that line together with the lanthanum X-rays that follow electron capture, and the shielding figures are correspondingly small; a calibration source is handled without special shielding. The source is made by irradiating lanthanum with protons or deuterons in a cyclotron, not in a reactor.",
      "Its half-life of months, in the decay table, means that a calibration set has to be decay-corrected at every use and replaced within a couple of years, and the certificates that accompany such sources state the reference date for that reason.",
    ],
  },
  "Ce-141": {
    heading: "Ce-141 as a short-lived fission product that marks fresh fuel",
    paragraphs: [
      "Ce-141 is a fission product with a high yield and a half-life of about a month, and that combination makes it a marker of recent fission. It appears in reactor coolant when fuel cladding has failed, in the gamma spectrum of fresh fallout, and in environmental samples during the first months after a release, after which it decays away and the longer-lived cerium isotope and the caesium isotopes remain.",
      "The page shows a photon table led by one medium-soft line with praseodymium X-rays below it, and a beta that is not listed separately in this dataset. In gamma spectrometry the main line is well separated from its neighbours and is one of the routine lines in fission-product analysis.",
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
      "Eu-154 forms from stable europium by neutron capture, so it appears both in irradiated fuel, where its ratio to Cs-137 is used as an indicator of burn-up, and in the concrete of reactor shields, where it accompanies Eu-152. Its gamma spectrum is rich and extends to high energy, and sealed Eu-154 sources serve as calibration standards for the upper part of a detector's range alongside Eu-152.",
      "This page's photon table is long and dominated by hard lines, and the lead half-value layer is among the larger ones on the site. The cascade of lines brings the same coincidence-summing caution as Eu-152: efficiency points taken close to the detector are biased unless corrected.",
      "With a half-life of years, Eu-154 outlives the first decade of cooling but not the first century, and it is among the nuclides setting the dose rate during dismantling of activated concrete. Little europium is absorbed from the gut; the external field is the practical concern.",
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
      "Its two gamma lines are energetic, as the photon table shows, and lead needs most of a centimetre to halve the field; it is one of the more penetrating tracer nuclides and is counted easily through tissue and through machine casings. The beta that accompanies the decay is not listed in this dataset.",
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
      "The photon table here is dominated by that single line with thallium X-rays beneath it, so the half-value layer figures are those of one energy and are straightforward to apply. The beta that precedes the gamma is not listed in this dataset.",
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
      "Mo-99 is the nuclide that the world's nuclear medicine departments depend on: it is loaded onto alumina in a generator, and its daughter Tc-99m is eluted from it every morning for a week or two. Most of it is made by fission of uranium targets in a handful of research reactors, and the fragility of that supply has caused repeated shortages; production by neutron capture on molybdenum and by accelerator routes is being developed to spread the risk.",
      "The figures on this page are those of the parent, which has a hard photon spectrum and an energetic beta, as the tables show; the lead half-value layer is substantial. That is why a generator is a heavy lead or depleted-uranium block and why the quality control of each elution includes a breakthrough test for the parent.",
      "With a half-life of a few days, a generator is useful for about two weeks and then returns to the supplier, where the molybdenum has decayed enough to be handled as ordinary waste. Staff dose arises during generator changes and elution, and the beta and bremsstrahlung from the parent are part of that.",
    ],
  },
  "Na-24": {
    heading: "Na-24 as the activation product of sodium in coolant, concrete and people",
    paragraphs: [
      "Na-24 forms when ordinary sodium captures a neutron, and it is met wherever sodium sits in a neutron field. In a sodium-cooled fast reactor it is the dominant activity of the primary coolant and the reason the primary circuit is inaccessible during operation. It appears in concrete and in soil around accelerators and reactors for a day or two after irradiation. And after a criticality accident the Na-24 produced in a person's own blood is the quickest measure of the neutron dose they received.",
      "The two gamma lines are among the most energetic on this site, as the photon table shows, and the lead layer here is correspondingly thick; a Na-24 source is also a check of a detector's response at the top of its range. This dataset omits the beta.",
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
    heading: "Sb-124 as a photoneutron source and an activation product of bearings",
    paragraphs: [
      "Sb-124 has one gamma line energetic enough to split the beryllium nucleus, and a capsule of antimony inside a beryllium shell is therefore a photoneutron source that emits nearly monoenergetic neutrons. Such sources are used to calibrate neutron monitors and as start-up sources in reactors, and they have the convenient property that the neutron output switches off as the antimony decays and can be restored by re-irradiation. The nuclide also forms by activation of the antimony in bearing alloys and solders, and appears in reactor circuits from that source.",
      "This page's photon table runs to many hard lines, with a lead half-value layer among the larger ones on the site, so a bare Sb-124 source is a penetrating gamma source before any neutrons are considered. The neutron output of an antimony-beryllium source is not part of these figures.",
      "Its half-life of weeks sets the re-irradiation cycle of photoneutron sources. The intake hazard is moderate, antimony being cleared relatively quickly, and the external gamma field is the practical concern.",
    ],
  },
  "Sb-125": {
    heading: "Sb-125 as a persistent antimony nuclide of fuel and effluent",
    paragraphs: [
      "Sb-125 is produced both by fission, in a small yield, and by activation of tin and antimony in cladding and components, and it is one of the medium-lived nuclides that remain in reprocessing effluent and in spent-fuel spectra after the first few years. It feeds a short-lived tellurium daughter whose X-rays and soft gamma add to its spectrum, and it has been detected in environmental samples after reactor accidents at low levels.",
      "The photon table here is long, with the dose rate spread across several medium-energy lines, and the shielding figures reflect that spread rather than a single energy. This dataset lists no beta for Sb-125.",
      "A half-life of a few years lets Sb-125 outlast the ruthenium and cerium isotopes of young waste and then gives way to the caesium and strontium isotopes. It has occasional use as a calibration nuclide where a medium-energy multi-line source is wanted.",
    ],
  },
  "Sc-46": {
    heading: "Sc-46 as the tracer in sediment, reservoir and wear studies",
    paragraphs: [
      "Sc-46 is a tracer nuclide. Glass beads or sand grains loaded with it are released to follow sediment transport in harbours and estuaries, it is injected into oil reservoirs and process plant to measure flow and residence time, and components doped with scandium are irradiated to follow wear. It is made by irradiating natural scandium in a reactor, and a half-life of months suits a field study of a season.",
      "Its two gamma lines are energetic and emitted in every decay, as the photon table shows, which is what makes a small activity detectable through water, sediment or pipe walls, and the lead on this page thins the field only slowly, needing close to a centimetre to halve it. The beta that precedes the gammas is not listed in this dataset.",
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
      "Its photon spectrum is rich and extends to high energies, as the long photon table shows, and the lead layer this page gives is among the thicker ones; a tantalum component removed from a reactor is handled remotely for that reason. This dataset's tables leave out the accompanying beta.",
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
      "Caesium X-rays dominate the photon table here, with one gamma line above them, and a fraction of a millimetre of lead halves the field; shielding is trivial. No beta appears in this dataset's tables for Xe-133. Being a noble gas it is not retained by the body; a release gives an external dose from immersion and a lung dose from the gas within.",
      "Imaging waste gas is held in a charcoal trap or a decay tank for a few half-lives rather than vented, and reactor off-gas systems use the same principle to let it decay before discharge.",
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
      "The photon table on this page is two lines of similar energy that share the dose rate, so the lead figures are straightforward. The beta before the gammas does not appear in this dataset. Its daughter adds a third line that grows in over weeks.",
      "Zirconium passes through the gut largely unabsorbed, and the gamma field from a sample is the usual concern. Within a year of fission the pair has decayed to insignificance, so it never appears in disposal inventories.",
    ],
  },
  "Au-198": {
    heading: "Au-198 as a neutron fluence monitor and a brachytherapy grain",
    paragraphs: [
      "Au-198 is made by neutron capture on the single stable isotope of gold, with a cross section and a half-life, in the decay table, that make gold foils the standard monitor of neutron fluence in reactors and accelerator fields: irradiate a foil, count its gamma, and the flux follows. The same nuclide has a long clinical history as gold grains and seeds implanted into tumours and, earlier, as colloidal gold for liver imaging and for treating malignant effusions.",
      "A lone line in nearly all decays, with a few weak companions, is the whole photon table, and the lead figures are those of a single energy. This dataset's tables leave out the energetic beta that precedes the gamma, but it is what delivers the dose from an implanted grain.",
      "With a half-life of days, a gold grain delivers its dose within a couple of weeks and can be left in place permanently, and foil activities decay to background in storage. Gold is inert in the body, so the intake hazard is slight.",
    ],
  },
  "Ga-67": {
    heading: "Ga-67 for imaging infection, inflammation and lymphoma",
    paragraphs: [
      "Ga-67 citrate was for decades the scintigraphy agent for finding infection, inflammation and lymphoma, because gallium binds to transferrin and accumulates where iron is being sequestered. It has been displaced in many centres by white-cell labelling and by PET, but it remains in use where those are unavailable. It is produced in a cyclotron from zinc and shipped daily.",
      "Its photon table is a set of three medium-soft lines sharing the dose rate, as the table shows, and gamma cameras image it with a medium-energy collimator using two or three windows at once; the lead layer on this page is modest. The decay is electron capture, so there is no beta and the patient's dose comes from the photons and from the Auger electrons close to the decay site.",
      "Its half-life allows imaging a day or more after injection, and clinic waste is held for a month before disposal. Gallium is cleared slowly through the gut, which is why bowel activity complicates the images.",
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
      "In-111 labels white blood cells and platelets for imaging infection and thrombosis, and it was the first nuclide used to image somatostatin receptors with a labelled peptide. Its decay by electron capture leaves no beta, but it emits two gamma lines of convenient energy for a gamma camera and a shower of Auger electrons close to the decay site, which has made it a candidate for therapy when carried into a cell nucleus.",
      "The photon table on this page shows those two lines sharing the dose rate with cadmium X-rays below them, and thin lead suffices, as the shielding table shows. Cameras use a medium-energy collimator for it, often with two energy windows together.",
      "The half-life of days suits cell-labelling studies, which image a day or two after injection, and the waste is held for a month. Indium is cleared slowly from the body, and the dose from labelled cells is concentrated in the spleen and marrow where the cells go.",
    ],
  },
  "Lu-177": {
    heading: "Lu-177 as the workhorse of radioligand therapy",
    paragraphs: [
      "Lu-177 has become the most widely used therapy nuclide of the last decade: labelled somatostatin analogues treat neuroendocrine tumours and labelled prostate antigen ligands treat advanced prostate cancer. It emits a beta of medium energy that delivers the dose within a few millimetres, and gamma lines that let the same treatment be imaged and its dose estimated. It is made in reactors either directly from lutetium, which produces a long-lived isomer as a by-product, or indirectly from ytterbium, which gives carrier-free material.",
      "This page's photon table shows the two imaging lines, and the shielding table confirms that lead stops them easily, so patient rooms need only modest shielding, and the beta, not listed in this dataset's tables, is absorbed in the patient. The gamma output is enough that patients are released with instructions about contact time rather than held for long.",
      "With a half-life of about a week, in the decay table, a dose can be shipped internationally and waste decays within a few months; the isomer that accompanies the directly produced material lasts much longer and governs the disposal of that waste.",
    ],
  },
  "Re-188": {
    heading: "Re-188 as a generator-produced therapy nuclide",
    paragraphs: [
      "Re-188 is eluted from a tungsten generator and used for therapy: labelled lipiodol for liver tumours, labelled phosphonates for bone pain, labelled microspheres and, historically, liquid-filled balloons for preventing restenosis after angioplasty. Its chemistry resembles that of technetium, so many technetium labelling kits can be adapted, and the generator makes it available in places without reactor supply.",
      "The photon table here is led by one modest line, which allows imaging of the distribution, and lead stops it within a couple of millimetres; the energetic beta that delivers the therapeutic dose is not listed in this dataset's tables. Shielding during preparation is a beta and bremsstrahlung matter.",
      "Since the half-life is hours, activity must be used the day it is eluted and that waste decays overnight; the generator itself lasts for months. Rhenium is cleared through the kidneys, and the thyroid takes up unbound perrhenate much as it does pertechnetate.",
    ],
  },
  "Tl-201": {
    heading: "Tl-201 as the thallium of myocardial perfusion imaging",
    paragraphs: [
      "Tl-201 as the chloride was the standard agent for imaging blood flow to the heart muscle for a generation, because thallium behaves like potassium and is taken up by working muscle in proportion to its blood supply. Technetium agents have replaced it in many centres, but it remains in use for rest and stress studies and for some tumour imaging. It is produced in a cyclotron from thallium or lead targets and shipped with its short half-life in mind.",
      "What a gamma camera actually images is the mercury X-rays that follow the electron-capture decay, which dominate the photon table on this page, with a gamma line above them; lead stops them readily, as the shielding table shows, and the energy is low for a camera, which costs some resolution. There is no beta.",
      "A half-life of days keeps the stock turnover short, and imaging waste is held for a month. Thallium's chemical toxicity is irrelevant at the microgram amounts involved, and the radiation dose, concentrated in kidneys and thyroid, is modest.",
    ],
  },
  "Sm-153": {
    heading: "Sm-153 for bone pain palliation",
    paragraphs: [
      "Sm-153 labelled with a phosphonate seeks out bone that is being remodelled around metastases, and its beta delivers a dose there that relieves pain for months; it is one of the two nuclides long used for that purpose alongside Sr-89, with the advantage that its gamma emission lets the distribution be imaged on the same day. It is produced by neutron irradiation of enriched samarium, and its half-life of a couple of days, in the decay table, means shipment and injection within the week.",
      "This page's photon table runs long but soft, dominated by X-rays and one gamma line of modest energy, and lead halves the field within a fraction of a millimetre; the therapeutic beta is absent from this dataset's tables. A treated patient is a weak external source and is released the same day with advice about excreta.",
      "Waste decays to background within a few weeks. The dose-limiting effect of treatment is suppression of the bone marrow, which follows from the deposition of the phosphonate in bone, not from any external exposure.",
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
