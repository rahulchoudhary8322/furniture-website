const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Map filenames to premium Unsplash royalty-free photos matching SDC inventory
const images = {
  'cat-furniture.jpg': 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-electronics.jpg': 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-decor.jpg': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-toys.jpg': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-bicycle.jpg': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&h=600&q=80',
  
  'cat-sofas.jpg': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-beds.jpg': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-dining.jpg': 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-study-table.jpg': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-almera.jpg': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-outdoor-chair.jpg': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-dressing-table.jpg': 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-coffee-table.jpg': 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-counter.jpg': 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&h=600&q=80',

  'cat-washing-machines.jpg': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-coolers.jpg': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-ac.jpg': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-earbuds.jpg': 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-neckbands.jpg': 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&h=600&q=80',

  'cat-clocks.jpg': 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-statues.jpg': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-flower-pots.jpg': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&h=600&q=80',

  'cat-toy-cars.jpg': 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=600&h=600&q=80',
  'cat-kids-scooty.jpg': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&h=600&q=80',
  
  'cat-bicycles.jpg': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&h=600&q=80',
  
  'recline-fab-1.jpg': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&h=600&q=80',
  'recline-fab-2.jpg': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=600&h=600&q=80',
  
  'recline-lea-1.jpg': 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&h=600&q=80',
  'recline-lea-2.jpg': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&h=600&q=80',
  
  'sofa-lshape-1.jpg': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&h=600&q=80',
  'sofa-lshape-2.jpg': 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=600&h=600&q=80',
  
  'sofa-wood-1.jpg': 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&h=600&q=80',
  'sofa-wood-2.jpg': 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=600&h=600&q=80',
  
  'dining-6s-1.jpg': 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&h=600&q=80',
  'dining-6s-2.jpg': 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=600&h=600&q=80',
  
  'tv-samsung-1.jpg': 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=600&h=600&q=80',
  'tv-samsung-2.jpg': 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=600&h=600&q=80',
  
  'ref-lg-1.jpg': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&h=600&q=80',
  'ref-lg-2.jpg': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&h=600&q=80',
  
  'statue-ganesha-1.jpg': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&h=600&q=80',
  'toy-blocks-1.jpg': 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&h=600&q=80',
  
  'banner-1.jpg': 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&h=500&q=80',
  'banner-2.jpg': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&h=500&q=80'
};

async function download(filename, url) {
  const dest = path.join(uploadDir, filename);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}. Status code: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.promises.writeFile(dest, buffer);
  console.log(`Downloaded ${filename} successfully (${buffer.length} bytes).`);
}

async function downloadAll() {
  console.log('Starting native Fetch image downloader (with redirect following)...');
  const entries = Object.entries(images);
  for (const [filename, url] of entries) {
    try {
      await download(filename, url);
    } catch (e) {
      console.error(`Failed to download ${filename}:`, e.message);
    }
  }
  console.log('All image downloads completed.');
}

downloadAll();
