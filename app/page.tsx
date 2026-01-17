'use client';

import React from 'react';
import Image from 'next/image';

const GITHUB_REPO = 'karlsson1000/AtomicLauncher';
const LATEST_RELEASE_API = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';

interface Release {
  tag_name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

export default function AtomicLauncher() {
  const [currentOS, setCurrentOS] = React.useState('');
  const [release, setRelease] = React.useState<Release | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [downloading, setDownloading] = React.useState<string | null>(null);

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('win')) setCurrentOS('windows');
    else if (userAgent.includes('mac')) setCurrentOS('macos');
    else if (userAgent.includes('linux')) setCurrentOS('linux');

    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
    };

    if (GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
    }

    fetch(LATEST_RELEASE_API, { headers })
      .then(res => {
        if (!res.ok) {
          throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        setRelease(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch release:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const getDownloadUrl = (os: string) => {
    if (!release) return '#';

    const asset = release.assets.find(a => {
      const name = a.name.toLowerCase();
      if (os === 'windows') return name.endsWith('.msi') || name.endsWith('.exe');
      if (os === 'macos') return name.endsWith('.dmg') || name.endsWith('.tar.gz');
      if (os === 'linux') return name.endsWith('.appimage') || name.endsWith('.deb');
      return false;
    });

    return asset?.browser_download_url || '#';
  };

  const getButtonClass = (os: string) => {
    return currentOS === os
      ? "bg-[#4572e3] text-white px-6 py-3 text-base font-medium rounded flex items-center gap-2 cursor-pointer hover:ring-2 hover:ring-[#4572e3] hover:ring-offset-2 hover:ring-offset-neutral-900 transition-all"
      : "bg-white text-black px-6 py-3 text-base font-medium rounded flex items-center gap-2 cursor-pointer hover:ring-2 hover:ring-[#4572e3] hover:ring-offset-2 hover:ring-offset-neutral-900 transition-all";
  };

  const handleDownload = async (os: string) => {
    const url = getDownloadUrl(os);
    if (url !== '#') {
      setDownloading(os);

      if (GITHUB_TOKEN && url.includes('api.github.com')) {
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${GITHUB_TOKEN}`,
              'Accept': 'application/octet-stream'
            }
          });

          if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = url.split('/').pop() || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
          } else {
            console.error('Download failed:', response.statusText);
          }
        } catch (err) {
          console.error('Download error:', err);
        }
      } else {
        window.location.href = url;
      }

      setTimeout(() => setDownloading(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-8 relative">
      {/* Background Image */}
      <div className="absolute inset-0 pointer-events-none select-none">
        <Image
          src="/bg.png"
          alt=""
          fill
          className="object-cover opacity-5"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Logo and Title */}
      <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none select-none z-10">
        <Image src="/logo.png" alt="Logo" width={24} height={24} priority />
        <h1 className="text-white text-base font-semibold">Atomic Launcher</h1>
      </div>

      {/* GitHub Link */}
      <a
        href="https://github.com/karlsson1000/AtomicLauncher"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-4 z-10 text-white/60 hover:text-[#4572e3] transition-colors"
        aria-label="GitHub"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>

      <div className="text-center relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Launcher Image */}
        <div className="mb-14 pointer-events-none select-none" style={{ perspective: "1200px" }}>
          <div style={{ transform: "rotateX(8deg) rotateZ(1deg)" }}>
            <Image
              src="/atomiclauncher.png"
              alt="Atomic Launcher"
              width={1920}
              height={1080}
              priority
              className="w-full max-w-[1000px] h-auto border border-white/10 rounded-lg shadow-2xl shadow-black/80"
              draggable={false}
            />
          </div>
        </div>

        {/* Download Text */}
        <p className="text-white/60 text-base mb-4">
          Available on
        </p>

        {/* Install Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            className={getButtonClass('windows')}
            onClick={() => handleDownload('windows')}
            disabled={loading || !release}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0,0H11.377V11.372H0ZM12.623,0H24V11.372H12.623ZM0,12.623H11.377V24H0Zm12.623,0H24V24H12.623Z"/>
            </svg>
            <span>{downloading === 'windows' ? 'Downloading...' : 'Windows'}</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>

          <button
            className={getButtonClass('linux')}
            onClick={() => handleDownload('linux')}
            disabled={loading || !release}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.642 8.084c-.364.189-.79.42-1.242.42s-.81-.209-1.066-.413c-.13-.101-.234-.202-.313-.276-.137-.108-.12-.259-.064-.254.094.012.108.136.168.191.08.075.18.172.302.269.243.192.567.38.973.38s.878-.238 1.167-.4c.163-.092.371-.256.541-.381.13-.095.125-.21.232-.198.107.013.028.127-.122.258a3.4 3.4 0 0 1-.576.404"></path>
              <path d="M19.649 17.77c-.142-.16-.209-.456-.281-.771s-.153-.654-.411-.874l-.002-.001a1 1 0 0 0-.317-.192c.359-1.065.219-2.126-.145-3.084-.444-1.177-1.222-2.202-1.815-2.903-.664-.838-1.313-1.633-1.301-2.808.021-1.793.197-5.118-2.958-5.122a5 5 0 0 0-.401.017c-3.526.283-2.59 4.008-2.643 5.255-.064.912-.249 1.631-.877 2.523-.736.876-1.774 2.295-2.266 3.771-.232.697-.342 1.407-.241 2.08a2 2 0 0 0-.091.089c-.216.231-.376.511-.555.699-.166.167-.403.229-.664.323s-.547.231-.721.565l-.001.002a1 1 0 0 0-.108.484c0 .154.023.311.046.461.048.313.097.609.032.81-.206.564-.232.954-.087 1.237s.444.409.783.479c.676.141 1.592.106 2.314.489l.062-.117-.061.118c.773.404 1.557.547 2.182.405.454-.104.821-.374 1.011-.789.489-.002 1.025-.209 1.885-.256.583-.047 1.312.207 2.149.16a1.1 1.1 0 0 0 .099.264c.324.649.928.946 1.571.896s1.329-.43 1.883-1.089l-.102-.085.102.084c.527-.64 1.403-.905 1.984-1.255.29-.175.525-.395.544-.713.018-.318-.169-.675-.599-1.152m-7.79-11.708c-.003-.234.036-.435.126-.639s.201-.351.358-.47.312-.174.494-.176h.009c.179 0 .332.053.489.167.159.116.274.261.366.463a1.5 1.5 0 0 1 .141.636c.002.235-.038.435-.127.639a1.2 1.2 0 0 1-.18.299l-.074-.033q-.133-.056-.237-.096c-.104-.04-.124-.044-.181-.064.041-.049.122-.108.151-.181a1 1 0 0 0 .072-.347l.002-.016a1 1 0 0 0-.05-.337c-.038-.113-.086-.195-.155-.263s-.139-.099-.223-.101h-.011a.32.32 0 0 0-.217.086.6.6 0 0 0-.174.25 1 1 0 0 0-.072.348l-.001.015a1 1 0 0 0 .014.2 2.5 2.5 0 0 0-.507-.171 2 2 0 0 1-.014-.19zm-2.144.052c-.012-.202.009-.376.064-.556s.13-.311.238-.418a.52.52 0 0 1 .349-.168h.03c.118 0 .225.04.335.127a.97.97 0 0 1 .284.389c.076.171.116.343.127.545v.002a1.5 1.5 0 0 1-.002.243q-.035.01-.068.021c-.128.044-.23.093-.328.158a.9.9 0 0 0 .003-.214v-.012a1 1 0 0 0-.068-.274.5.5 0 0 0-.138-.203c-.052-.044-.1-.065-.153-.064l-.017.001c-.061.005-.11.034-.157.092a.54.54 0 0 0-.101.223.9.9 0 0 0-.019.293l.001.012c.01.103.031.189.067.275a.53.53 0 0 0 .166.224c-.059.045-.098.078-.146.113l-.11.081a1 1 0 0 1-.229-.342 1.5 1.5 0 0 1-.128-.546zm.155 1.228c.187-.14.315-.234.402-.298.086-.063.121-.086.148-.112h.001c.14-.132.362-.374.699-.49.115-.04.245-.065.39-.066.275-.001.608.089 1.01.348.247.16.439.174.882.363h.001c.213.087.338.202.399.321q.09.18.012.387c-.103.273-.429.562-.887.705h-.001c-.224.072-.418.233-.647.364a1.45 1.45 0 0 1-.842.217 1.1 1.1 0 0 1-.374-.083 1.2 1.2 0 0 1-.27-.167c-.161-.131-.303-.295-.51-.416h-.002c-.333-.19-.515-.408-.573-.598-.057-.189-.003-.351.162-.475m.131 13.018v.001c-.047.623-.398.961-.938 1.085-.539.123-1.27 0-1.999-.381h-.001c-.808-.427-1.768-.385-2.384-.514-.308-.064-.509-.161-.602-.341s-.094-.494.102-1.028l.001-.002.001-.002c.097-.299.025-.626-.021-.934-.047-.307-.07-.586.034-.781l.001-.002c.135-.259.332-.352.576-.439.245-.088.534-.157.764-.386l.001-.001.001-.001c.212-.223.371-.503.557-.702.157-.167.314-.279.551-.28h.009q.061 0 .132.011c.314.047.588.268.853.625l.762 1.389h.001c.202.423.631.89.994 1.365.362.475.644.952.607 1.317zm-.063-1.01a7 7 0 0 0-.333-.469 14 14 0 0 0-.229-.293q.227 0 .384-.072a.49.49 0 0 0 .266-.274c.09-.242 0-.583-.288-.973-.29-.39-.778-.83-1.494-1.269-.527-.328-.821-.729-.959-1.165s-.119-.907-.013-1.373c.204-.894.729-1.762 1.063-2.308.09-.066.032.123-.339.811-.332.629-.953 2.081-.103 3.214a6.7 6.7 0 0 1 .538-2.398c.472-1.067 1.456-2.919 1.534-4.395.041.029.18.123.241.158.182.106.316.262.492.403.177.142.396.264.729.283l.093.003c.343 0 .61-.112.833-.239.242-.138.436-.292.618-.351h.001c.387-.122.694-.335.869-.585.302 1.186 1.001 2.897 1.45 3.733.239.443.715 1.385.92 2.52q.195-.005.427.054c.537-1.393-.455-2.892-.909-3.31-.184-.178-.192-.258-.102-.254.492.436 1.139 1.311 1.374 2.3.107.451.13.925.016 1.393q.084.034.171.076c.862.42 1.181.785 1.027 1.283q-.076-.002-.148 0h-.014c.125-.395-.151-.687-.889-1.02-.764-.336-1.373-.303-1.476.379a1 1 0 0 0-.017.109q-.085.03-.172.076c-.358.197-.555.553-.664.99s-.14.964-.17 1.558c-.019.298-.141.702-.266 1.129-1.249.897-2.986 1.283-4.461.276m9.628.057c-.524.317-1.456.593-2.05 1.313-.517.615-1.146.952-1.7.996-.555.044-1.033-.186-1.315-.752v-.001l-.001-.003c-.175-.333-.102-.858.045-1.412s.359-1.123.388-1.585v-.001c.03-.592.063-1.11.163-1.509s.256-.669.533-.821l.039-.02c.031.513.285 1.036.734 1.149.491.129 1.199-.292 1.498-.636q.09-.004.175-.007c.262-.006.481.009.707.205v.001h.001c.173.146.255.423.326.733s.128.647.342.888h.001c.41.456.542.764.531.96-.011.198-.153.344-.417.502"></path>
              <path d="M11.738 6.762c.015.048.093.04.138.063.04.02.071.065.116.066.042.001.107-.015.113-.057.008-.056-.073-.091-.126-.111-.067-.026-.153-.039-.216-.004-.014.008-.03.027-.025.043m-.46 0c-.016.048-.094.04-.139.063-.039.02-.071.065-.115.066-.042.001-.108-.015-.114-.057-.007-.056.074-.091.126-.111.067-.026.153-.039.217-.004.015.008.03.027.025.043"></path>
            </svg>
            <span>{downloading === 'linux' ? 'Downloading...' : 'Linux'}</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>

          <button
            className={getButtonClass('macos')}
            onClick={() => handleDownload('macos')}
            disabled={loading || !release}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.94,5.19A4.38,4.38,0,0,0,16,2,4.44,4.44,0,0,0,13,3.52,4.17,4.17,0,0,0,12,6.61,3.69,3.69,0,0,0,14.94,5.19Zm2.52,7.44a4.51,4.51,0,0,1,2.16-3.81,4.66,4.66,0,0,0-3.66-2c-1.56-.16-3,.92-3.8.92s-2-.89-3.3-.87A4.92,4.92,0,0,0,4.69,9.39C2.93,12.45,4.24,17,6,19.47,6.8,20.68,7.8,22.05,9.12,22s1.75-.82,3.28-.82,2,.82,3.3.79,2.22-1.24,3.06-2.45a11,11,0,0,0,1.38-2.85A4.41,4.41,0,0,1,17.46,12.63Z"/>
            </svg>
            <span>{downloading === 'macos' ? 'Downloading...' : 'macOS'}</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && !loading && (
          <p className="text-red-400 text-sm mt-4">
            Failed to load releases.
          </p>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="absolute bottom-6 left-0 right-0 z-10">
        <p className="text-white/40 text-xs text-center">
          Not affiliated with Mojang Studios or Microsoft
        </p>
      </div>
    </div>
  );
}