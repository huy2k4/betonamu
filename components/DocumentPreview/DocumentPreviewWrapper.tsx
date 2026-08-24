'use client';

import dynamic from 'next/dynamic';

const DocumentPreview = dynamic(() => import('./DocumentPreview'), {
  ssr: false,
});

export default DocumentPreview;
