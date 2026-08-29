import urllib.request
import json
import sys

def audit(strategy='mobile'):
    url = f"https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://ubit-results-28.vercel.app/&category=performance&category=accessibility&category=best-practices&category=seo&strategy={strategy}"
    print(f"\n--- Running PageSpeed Insights ({strategy.upper()}) ---")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            data = json.loads(res.read().decode())
            lh = data.get('lighthouseResult', {})
            cats = lh.get('categories', {})
            print(f"\n📊 SCORES ({strategy.upper()}):")
            for k, v in cats.items():
                title = v.get('title')
                score = int(v.get('score', 0) * 100)
                print(f"  • {title}: {score}/100")
            
            audits = lh.get('audits', {})
            print(f"\n⏱️ CORE WEB VITALS ({strategy.upper()}):")
            for metric in ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index']:
                m = audits.get(metric, {})
                print(f"  • {m.get('title')}: {m.get('displayValue')}")
                
            print(f"\n🔍 OPPORTUNITIES & DIAGNOSTICS ({strategy.upper()}):")
            for k, a in audits.items():
                score = a.get('score')
                if score is not None and score < 0.9 and a.get('details', {}).get('type') == 'opportunity':
                    print(f"  ⚠️ {a.get('title')}: {a.get('displayValue', '')} ({a.get('description', '')[:80]}...)")
                    
            # SEO specific audits
            print(f"\n🔎 SEO AUDITS:")
            seo_items = ['document-title', 'meta-description', 'http-status-code', 'link-text', 'is-crawlable', 'robots-txt', 'image-alt', 'canonical', 'viewport']
            for s in seo_items:
                a = audits.get(s)
                if a:
                    status = "✅ PASS" if a.get('score') == 1 else "❌ FAIL"
                    print(f"  {status}: {a.get('title')}")
                    
    except Exception as e:
        print(f"Error during {strategy} audit:", e)

if __name__ == '__main__':
    audit('mobile')
    audit('desktop')
