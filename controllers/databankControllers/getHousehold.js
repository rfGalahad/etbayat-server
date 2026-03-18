import pool from '../../config/db.js';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export const getHousehold = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        h.household_id AS householdId,

        CASE
          WHEN h.multiple_family = FALSE THEN
            CONCAT(
              MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.last_name END), ', ',
              MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.first_name END),
              IF(
                MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END) IS NOT NULL
                AND MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END) <> '',
                CONCAT(' ', MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.middle_name END)),
                ''
              ),
              IF(
                MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END) IS NOT NULL
                AND MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END) <> '',
                CONCAT(' ', MAX(CASE WHEN p.relation_to_family_head = 'Family Head' THEN p.suffix END)),
                ''
              )
            )
          ELSE
            CONCAT(
              h.family_head_last_name, ', ',
              h.family_head_first_name,
              IF(h.family_head_middle_name IS NOT NULL AND h.family_head_middle_name <> '',
                CONCAT(' ', h.family_head_middle_name), ''),
              IF(h.family_head_suffix IS NOT NULL AND h.family_head_suffix <> '',
                CONCAT(' ', h.family_head_suffix), '')
            )
        END AS familyHead,

        h.house_structure  AS houseStructure,
        h.house_condition  AS houseCondition,
        h.latitude,
        h.longitude,
        h.street,
        h.barangay,

        -- 1 if at least one image exists, 0 otherwise
        IF(COUNT(hi.house_image_url) > 0, 1, 0) AS hasHouseImage,

        -- Aggregates all image URLs into a JSON array e.g. ["url1","url2"]
        -- Returns NULL when there are no images
        NULLIF(
          JSON_ARRAYAGG(hi.house_image_url),
          JSON_ARRAY(NULL)
        ) AS images

      FROM households h
      LEFT JOIN house_images hi
          ON hi.household_id = h.household_id
      LEFT JOIN family_information f
          ON h.household_id = f.household_id
      LEFT JOIN population p
          ON f.family_id = p.family_id

      GROUP BY
          h.household_id,
          h.multiple_family,
          h.family_head_first_name,
          h.family_head_middle_name,
          h.family_head_last_name,
          h.family_head_suffix,
          h.house_structure,
          h.house_condition,
          h.latitude,
          h.longitude,
          h.street,
          h.barangay

      ORDER BY h.household_id;
    `);

    // mysql2 automatically deserializes JSON_ARRAYAGG into a JS array
    const data = rows.map(row => ({
      ...row,
      images: row.images ?? [],
    }));

    res.status(200).json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Error fetching household data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching household data',
      error: error.message,
    });
  }
};



const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Logo helpers ─────────────────────────────────────────────────────────────

/**
 * Reads a local asset file and returns a base64 data URI.
 * Logos are served from the server's assets folder so we read them from disk —
 * no HTTP round-trip needed.
 */
const logoToBase64 = (filename) => {
  try {
    const filePath = path.join(__dirname, '../../assets', filename);
    const buffer   = fs.readFileSync(filePath);
    const ext      = path.extname(filename).replace('.', '');
    return `data:image/${ext};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
};


// ─── HTML template ────────────────────────────────────────────────────────────

const buildHtml = (householdByBarangay, meta) => {
  const { generatedDate, barangayFilter, structureFilter, mswdoLogo, itbayatLogo } = meta;

  const structureLabel = structureFilter === 'all'
    ? 'All Structures'
    : Array.isArray(structureFilter)
      ? structureFilter.join(', ')
      : structureFilter;

  const barangaySections = Object.entries(householdByBarangay).map(([barangayName, households]) => {
    const rows = households.map((hh, index) => {
      const imagesCells = (hh.images || []).map(url =>
        `<img src="${url}" alt="house photo" onerror="this.style.display='none'" />`
      ).join('');

      return `
        <tr class="${index % 2 === 0 ? '' : 'alt'}">
          <td class="center">${index + 1}</td>
          <td>${hh.householdId ?? '—'}</td>
          <td>${hh.familyHead ?? '—'}</td>
          <td>${hh.houseStructure ?? '—'}</td>
          <td>${hh.houseCondition ?? '—'}</td>
          <td>${hh.street ?? '—'}</td>
          <td class="photos">${imagesCells || '<span class="no-photo">No photos</span>'}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="barangay-section">
        <div class="barangay-title">BRGY. ${barangayName.toUpperCase()}</div>
        <table>
          <thead>
            <tr>
              <th class="col-no">No.</th>
              <th class="col-id">Household ID</th>
              <th class="col-head">Family Head</th>
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
  }).join('');

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: Arial, sans-serif;
        font-size: 8.5pt;
        color: #1a1a1a;
      }

      /* ── Page header (repeats on every printed page) ── */
      .page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 32px 8px;
        border-bottom: 2.5px solid #1a4fa0;
        margin-bottom: 16px;
      }
      .logo-box {
        width: 80px;
        display: flex;
        align-items: center;
      }
      .logo-box.right { justify-content: flex-end; }
      .logo-box img { width: 48px; height: 48px; object-fit: contain; }

      .title-block {
        flex: 1;
        text-align: center;
      }
      .title-block .org   { font-size: 8pt;  color: #555; margin-bottom: 2px; }
      .title-block h1     { font-size: 15pt; font-weight: 700; color: #1a4fa0; margin-bottom: 2px; }
      .title-block .brgy  { font-size: 10pt; font-weight: 700; color: #1a1a1a; }
      .title-block .meta  { font-size: 7.5pt; color: #777; margin-top: 3px; }

      /* ── Content ── */
      .content { padding: 0 32px 32px; }

      .barangay-section { margin-bottom: 24px; }

      .barangay-title {
        background: #e8eef8;
        color: #1a4fa0;
        font-weight: 700;
        font-size: 9pt;
        padding: 5px 10px;
        margin-bottom: 0;
        border: 0.5px solid #c5cfe8;
        border-bottom: none;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      thead tr { background: #1a4fa0; }
      thead th {
        color: #fff;
        font-size: 7.5pt;
        font-weight: 700;
        padding: 6px 6px;
        text-align: left;
        border: 0.5px solid #3a6fc0;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      thead th.center { text-align: center; }

      /* Column widths */
      .col-no        { width: 30px;  text-align: center; }
      .col-id        { width: 90px;  }
      .col-head      { width: 120px; }
      .col-structure { width: 100px; }
      .col-condition { width: 90px;  }
      .col-street    { width: 90px;  }
      .col-photos    { width: auto;  }

      tbody tr { border-bottom: 0.5px solid #c5cfe8; }
      tbody tr.alt { background: #f8f9ff; }

      tbody td {
        padding: 6px 6px;
        vertical-align: middle;
        font-size: 8pt;
        border: 0.5px solid #d5dff0;
        word-break: break-word;
      }
      tbody td.center { text-align: center; color: #888; }
      tbody td.photos {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        gap: 6px;
        align-items: center;
        padding: 6px;
      }

      /* ── Images ── */
      td.photos img {
        width: 110px;
        height: 95px;
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

      /* ── Print rules ── */
      @media print {
        .page-header {
          position: running(header);
        }
        @page {
          size: A4 landscape;
          margin: 60px 32px 40px;
          @top-center { content: element(header); }
        }
        .barangay-section { page-break-inside: avoid; }
        tbody tr          { page-break-inside: avoid; }
      }
    </style>
  </head>
  <body>

    <div class="page-header">
      <div class="logo-box left">
        ${mswdoLogo ? `<img src="${mswdoLogo}" alt="MSWDO Logo" />` : ''}
      </div>

      <div class="title-block">
        <p class="org">Municipality of Itbayat</p>
        <h1>HOUSEHOLD MASTERLIST</h1>
        <p class="brgy">Barangay ${barangayFilter === 'all' ? 'ALL BARANGAYS' : barangayFilter.toUpperCase()}</p>
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


// ─── Main controller ──────────────────────────────────────────────────────────

// Maps structure IDs from query params → DB field values
const HOUSE_STRUCTURE_MAP = {
  concrete:      'Concrete',
  semi_concrete: 'Semi-Concrete',
  light_gi:      'Light Materials (GI Sheets/Pipes)',
  light_cogon:   'Light Materials (Traditional Cogon House)',
  make_shift:    'Make Shift',
};

export const exportHouseholdPdf = async (req, res) => {
  let browser;
  try {
    const { barangay = 'all', structures } = req.query;

    // ── 1. Fetch data ─────────────────────────────────────────────────────────
    const [rows] = await pool.query(`
      SELECT
        h.household_id   AS householdId,
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
        h.house_structure  AS houseStructure,
        h.house_condition  AS houseCondition,
        h.street,
        h.barangay,
        NULLIF(JSON_ARRAYAGG(hi.house_image_url), JSON_ARRAY(NULL)) AS images
      FROM households h
      LEFT JOIN house_images hi        ON hi.household_id = h.household_id
      LEFT JOIN family_information f   ON h.household_id  = f.household_id
      LEFT JOIN population p           ON f.family_id     = p.family_id
      GROUP BY
        h.household_id, h.multiple_family,
        h.family_head_first_name, h.family_head_middle_name,
        h.family_head_last_name,  h.family_head_suffix,
        h.house_structure, h.house_condition,
        h.street, h.barangay
      ORDER BY h.household_id;
    `);

    // ── 2. Filter ─────────────────────────────────────────────────────────────
    let data = rows.map(row => ({ ...row, images: row.images ?? [] }));

    if (barangay !== 'all') {
      data = data.filter(hh => hh.barangay === barangay);
    }

    let structureFilter = 'all';
    if (structures) {
      const ids              = structures.split(',').map(s => s.trim());
      const allowedStructures = ids.map(id => HOUSE_STRUCTURE_MAP[id]).filter(Boolean);
      structureFilter        = allowedStructures;
      data = data.filter(hh => allowedStructures.includes(hh.houseStructure));
    }

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'No households found for the given filters.' });
    }

    // ── 3. Group by barangay ──────────────────────────────────────────────────
    const householdByBarangay = data.reduce((acc, hh) => {
      const brgy = hh.barangay || 'Unknown';
      if (!acc[brgy]) acc[brgy] = [];
      acc[brgy].push(hh);
      return acc;
    }, {});

    // ── 4. Load logos from disk ───────────────────────────────────────────────
    const mswdoLogo   = logoToBase64('mswdoLogo.png');
    const itbayatLogo = logoToBase64('itbayatLogo.png');

    const generatedDate = new Date().toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // ── 5. Build HTML ─────────────────────────────────────────────────────────
    const html = buildHtml(householdByBarangay, {
      generatedDate,
      barangayFilter: barangay,
      structureFilter,
      mswdoLogo,
      itbayatLogo,
    });

    // ── 6. Launch Puppeteer and print to PDF ──────────────────────────────────
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // prevents crashes in low-memory environments
      ],
    });

    const page = await browser.newPage();

    // Set content and wait for all Cloudinary images to finish loading
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 120000 });

    const pdfBuffer = await page.pdf({
      format:              'A4',
      landscape:           true,
      printBackground:     true,
      margin: { top: '65px', right: '32px', bottom: '40px', left: '32px' },
      displayHeaderFooter: true,
      // Page number footer
      footerTemplate: `
        <div style="width:100%; font-size:7pt; color:#888; padding:0 32px; display:flex; justify-content:space-between;">
          <span>Total records: ${data.length} &nbsp;|&nbsp; Prepared by: Barangay Secretary &nbsp;|&nbsp; Certified true and correct</span>
          <span><span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>`,
      headerTemplate: '<div></div>', // suppress default header
    });

    await browser.close();
    browser = null;

    // ── 7. Stream PDF back to client ──────────────────────────────────────────
    const date           = new Date().toISOString().split('T')[0];
    const barangayPrefix = barangay === 'all' ? 'All' : barangay;
    const filename       = `Household_Masterlist_${barangayPrefix}_${date}.pdf`;

    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length',      pdfBuffer.length);
    res.end(pdfBuffer);

  } catch (error) {
    if (browser) await browser.close();
    console.error('Error generating household PDF:', error);
    res.status(500).json({
      success:  false,
      message:  'Error generating PDF',
      error:    error.message,
    });
  }
};