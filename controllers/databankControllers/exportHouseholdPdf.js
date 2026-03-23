import pool from '../../config/db.js';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const HOUSE_STRUCTURE_LABELS = {
  concrete:      'Concrete',
  semi_concrete: 'Semi-Concrete',
  light_gi:      'Light Materials (GI Sheets/Pipes)',
  light_cogon:   'Light Materials (Traditional Cogon House)',
  make_shift:    'Make Shift',
};

const PUPPETEER_LAUNCH_OPTIONS = {
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ],
};

const PDF_PAGE_OPTIONS = {
  format:          'A4',
  landscape:       true,
  printBackground: true,
  margin: {
    top:    '20px',
    right:  '32px',
    bottom: '50px',
    left:   '32px',
  },
};


// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const encodeLogoAsBase64 = (filename) => {
  try {
    const filePath  = path.join(__dirname, '../../assets', filename);
    const buffer    = fs.readFileSync(filePath);
    const extension = path.extname(filename).replace('.', '');
    return `data:image/${extension};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
};

const waitForImagesToLoad = (page) =>
  page.evaluate(() => {
    const images = [...document.querySelectorAll('img')];
    return Promise.allSettled(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload  = resolve;
          img.onerror = resolve;           // don't block on broken images
          setTimeout(resolve, 5000);       // 5s max wait per image
        });
      })
    );
  });

const groupHouseholdsByBarangay = (households) =>
  households.reduce((groups, household) => {
    const barangay = household.barangay || 'Unknown';
    if (!groups[barangay]) groups[barangay] = [];
    groups[barangay].push(household);
    return groups;
  }, {});

const resolveStructureFilter = (structuresParam) => {
  const ids    = structuresParam.split(',').map(s => s.trim());
  const labels = ids.map(id => HOUSE_STRUCTURE_LABELS[id]).filter(Boolean);
  return {
    labels,
    displayText: labels.join(', '),
  };
};

const getFormattedDate = () =>
  new Date().toLocaleDateString('en-PH', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  });


// ─────────────────────────────────────────────────────────────────────────────
// SQL QUERY
// ─────────────────────────────────────────────────────────────────────────────


const fetchAllHouseholds = async () => {
  const [rows] = await pool.query(`
    SELECT
      h.household_id AS householdId,

      CASE
        WHEN h.multiple_family = FALSE THEN
          CONCAT(
            MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.last_name  END), ', ',
            MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.first_name END),
            IF(MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END) IS NOT NULL
              AND MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END) <> '',
              CONCAT(' ', MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END)), ''),
            IF(MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END) IS NOT NULL
              AND MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END) <> '',
              CONCAT(' ', MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END)), '')
          )
        ELSE
          CONCAT(
            h.family_head_last_name, ', ', h.family_head_first_name,
            IF(h.family_head_middle_name IS NOT NULL AND h.family_head_middle_name <> '',
              CONCAT(' ', h.family_head_middle_name), ''),
            IF(h.family_head_suffix IS NOT NULL AND h.family_head_suffix <> '',
              CONCAT(' ', h.family_head_suffix), '')
          )
      END AS familyHead,

      h.house_structure AS houseStructure,
      h.house_condition AS houseCondition,
      h.street,
      h.barangay,

      (
        SELECT JSON_ARRAYAGG(hi.house_image_url)
        FROM house_images hi
        WHERE hi.household_id = h.household_id
      ) AS images

    FROM households h
    LEFT JOIN house_images hi      ON hi.household_id = h.household_id
    LEFT JOIN family_information f ON h.household_id  = f.household_id
    LEFT JOIN population p         ON f.family_id     = p.family_id

    GROUP BY
      h.household_id, h.multiple_family,
      h.family_head_first_name, h.family_head_middle_name,
      h.family_head_last_name,  h.family_head_suffix,
      h.house_structure, h.house_condition,
      h.street, h.barangay

    ORDER BY h.household_id;
  `);

  // Ensure images is always an array (never null) for easier rendering
  return rows.map(row => ({ ...row, images: row.images ?? [] }));
};


// ─────────────────────────────────────────────────────────────────────────────
// HTML TEMPLATE BUILDERS
// ─────────────────────────────────────────────────────────────────────────────


const buildStyles = () => `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Arial, sans-serif;
      font-size: 8.5pt;
      color: #1a1a1a;
    }

    /* ── Page Header (logos + title) ── */
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 32px 8px;
      border-bottom: 1px solid black;
      margin-bottom: 16px;
    }
    .logo-box            { width: 80px; display: flex; align-items: center; }
    .logo-box.right      { justify-content: flex-end; }
    .logo-box img        { width: 48px; height: 48px; object-fit: contain; }
    .title-block         { flex: 1; text-align: center; }
    .title-block .org    { font-size: 8pt; color: #555; margin-bottom: 2px; }
    .title-block h1      { font-size: 15pt; font-weight: 700; color: #1a4fa0; margin-bottom: 2px; }
    .title-block .brgy   { font-size: 10pt; font-weight: 700; color: #1a1a1a; }
    .title-block .meta   { font-size: 7.5pt; color: #777; margin-top: 3px; }

    /* ── Content Area ── */
    .content             { padding: 0 32px 32px; }
    .barangay-section    { margin-bottom: 24px; }
    .barangay-title {
      background: #e8eef8;
      color: #1a4fa0;
      font-weight: 700;
      font-size: 9pt;
      padding: 5px 10px;
      border: 0.5px solid #c5cfe8;
      border-bottom: none;
    }

    /* ── Table ── */
    table                { width: 100%; border-collapse: collapse; table-layout: fixed; }
    thead tr             { background: #1a4fa0; }
    thead th {
      color: #fff;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 6px;
      text-align: left;
      border: 0.5px solid #3a6fc0;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* ── Column Widths ── */
    .col-no        { width: 30px;  text-align: center; }
    .col-id        { width: 90px;  }
    .col-head      { width: 120px; }
    .col-structure { width: 100px; }
    .col-condition { width: 90px;  }
    .col-street    { width: 90px;  }
    .col-photos    { width: auto;  }

    /* ── Table Body ── */
    tbody tr             { border-bottom: 0.5px solid #c5cfe8; }
    tbody tr.alt         { background: #f8f9ff; }
    tbody td {
      padding: 6px;
      vertical-align: middle;
      font-size: 8pt;
      border: 0.5px solid #d5dff0;
      word-break: break-word;
    }
    tbody td.center      { text-align: center; color: #888; }

    /* ── Photo Cell ── */
    tbody td.photos {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      align-content: center;
      padding: 6px;
    }
    td.photos img {
      width: auto;
      height: 300px;
      object-fit: cover;
      border-radius: 3px;
      border: 0.5px solid #c5cfe8;
      display: block;
      flex-shrink: 0;
    }
      
    .no-photo { 
      font-size: 7.5pt; 
      color: #aaa; 
      font-style: italic; 
    }

    /* ── Print Hints ── */
    @media print {
      .barangay-section  { page-break-inside: avoid; }
      tbody tr           { page-break-inside: avoid; }
    }
  </style>
`;

const buildHouseholdRow = (household, rowIndex) => {
  const photoHtml = household.images.length > 0
    ? household.images
        .map(url => `<img src="${url}" alt="house photo" onerror="this.style.display='none'" />`)
        .join('')
    : '<span class="no-photo">No photos</span>';

  return `
    <tr class="">
      <td class="center">${rowIndex + 1}</td>
      <td>${household.householdId    ?? '—'}</td>
      <td>${household.familyHead     ?? '—'}</td>
      <td>${household.houseStructure ?? '—'}</td>
      <td>${household.houseCondition ?? '—'}</td>
      <td>${household.street         ?? '—'}</td>
      <td class="photos">${photoHtml}</td>
    </tr>
  `;
};

const buildBarangaySection = (barangayName, households) => {
  const rows = households.map(buildHouseholdRow).join('');

  return `
    <div class="barangay-section">
      <div class="barangay-title">BRGY. ${barangayName.toUpperCase()}</div>
      <table>
        <thead>
          <tr>
            <th class="col-no">No.</th>
            <th class="col-id">Household ID</th>
            <th class="col-head">Household Head</th>
            <th class="col-structure">House Structure</th>
            <th class="col-condition">House Condition</th>
            <th class="col-street">Street</th>
            <th class="col-photos">Photos</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

const buildHtml = (householdsByBarangay, headerInfo) => {

  const { 
    generatedDate, 
    barangayFilter, 
    structureLabel, 
    mswdoLogo, 
    itbayatLogo 
  } = headerInfo;

  const barangayLabel  = barangayFilter === 'all'
    ? 'ALL BARANGAYS'
    : barangayFilter.toUpperCase();

  const barangaySections = Object.entries(householdsByBarangay)
    .map(([name, households]) => buildBarangaySection(name, households))
    .join('');

  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      ${buildStyles()}
    </head>
    <body>

      <div class="page-header">
        <div class="logo-box left">
          ${mswdoLogo ? `<img src="${mswdoLogo}" alt="MSWDO Logo" />` : ''}
        </div>
        <div class="title-block">
          <p class="org">Municipality of Itbayat</p>
          <h1>HOUSEHOLD MASTERLIST</h1>
          <p class="brgy">Barangay ${barangayLabel}</p>
          <p class="meta">Date Generated: ${generatedDate} &nbsp;|&nbsp; Structure: ${structureLabel}</p>
        </div>
        <div class="logo-box right">
          ${itbayatLogo ? `<img src="${itbayatLogo}" alt="Itbayat Logo" />` : ''}
        </div>
      </div>

      <div class="content">
        ${barangaySections}
      </div>

    </body>
    </html>`;
};

const buildFooterTemplate = (totalRecords) => `
  <div style="
    width: 100%;
    font-size: 7pt;
    color: #888;
    padding: 0 32px;
    display: flex;
    justify-content: space-between;
    font-family: Arial, sans-serif;
  ">
    <span>
      Total records: ${totalRecords}
      &nbsp;|&nbsp; Prepared by: Barangay Secretary
      &nbsp;|&nbsp; Certified true and correct
    </span>
    <span>
      <span class="pageNumber"></span> of <span class="totalPages"></span>
    </span>
  </div>
`;


// ─────────────────────────────────────────────────────────────────────────────
// MAIN CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

export const exportHouseholdPdf = async (req, res) => {

  console.log('EXPORTING...');

  let browser;

  try {
    const { barangay = 'all', structures } = req.query;


    // ── Step 1: Fetch all households from the database ──────────────────────

    let households = await fetchAllHouseholds();


    // ── Step 2: Apply filters ────────────────────────────────────────────────

    if (barangay !== 'all') {
      households = households.filter(hh => hh.barangay === barangay);
    }

    let structureLabel = 'All Structures';

    if (structures) {
      const { labels, displayText } = resolveStructureFilter(structures);
      households     = households.filter(hh => labels.includes(hh.houseStructure));
      structureLabel = displayText;
    }

    if (households.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No households found for the given filters.',
      });
    }


    // ── Step 3: Prepare data for the template ────────────────────────────────

    const householdsByBarangay = groupHouseholdsByBarangay(households);

    const headerInfo = {
      generatedDate:  getFormattedDate(),
      barangayFilter: barangay,
      structureLabel,
      mswdoLogo:      encodeLogoAsBase64('mswdoLogo.png'),
      itbayatLogo:    encodeLogoAsBase64('itbayatLogo.png'),
    };


    // ── Step 4: Build HTML ───────────────────────────────────────────────────

    const html = buildHtml(householdsByBarangay, headerInfo);


    // ── Step 5: Launch Puppeteer and render the PDF ──────────────────────────

    console.log('[PDF] Launching Puppeteer...');
    browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTIONS);

    const page = await browser.newPage();

    // Log browser-side errors to the server console for easier debugging
    page.on('console',   msg => { if (msg.type() === 'error') console.error('[PDF Browser]', msg.text()); });
    page.on('pageerror', err => console.error('[PDF PageError]', err.message));

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForImagesToLoad(page);

    const pdfBuffer = Buffer.from(
      await page.pdf({
        ...PDF_PAGE_OPTIONS,
        displayHeaderFooter: true,
        headerTemplate:      '<div></div>',
        footerTemplate:      buildFooterTemplate(households.length),
      })
    );

    await browser.close();
    browser = null;

    console.log(`[PDF] Generated successfully — ${pdfBuffer.length} bytes`);


    // ── Step 6: Send the PDF as a downloadable file ──────────────────────────

    const date     = new Date().toISOString().split('T')[0];
    const prefix   = barangay === 'all' ? 'All' : barangay;
    const filename = `Household_Masterlist_${prefix}_${date}.pdf`;

    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control',       'no-cache');
    res.send(pdfBuffer);

  } catch (error) {
    if (browser) await browser.close();

    console.error('[PDF] Failed to generate PDF:', error.message);
    console.error(error.stack);

    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error:   error.message,
      stack:   error.stack,
    });
  }
};