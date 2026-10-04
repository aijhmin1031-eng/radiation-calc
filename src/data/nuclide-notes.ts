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
 *  ★ 영국식 철자(metre · sterilisation · ionisation) — 사이트의 다른 글과 같다. */
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
};

export const NOTE_KEYS = Object.keys(NUCLIDE_NOTES);
