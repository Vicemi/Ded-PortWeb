"""Publishes a GitHub release with the Windows installer attached (the desktop version looks for it to offer updates).

usage: python tools/publish_release.py <version> [notes.md]
  - the version is the one of desktop/Cargo.toml ([workspace.package]) and the tag is v<version>
  - the notes (default: CHANGELOG.md, the section of that version) become the description of the release = the changelog the players see in the game
  - needs desktop/release/DED-Instalador.exe (python tools/build_desktop.py) and the commit pushed to origin/main
The token is the one git already has for github.com (git credential); it is never printed."""
import json, os, re, subprocess, sys, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = 'Vicemi/Ded-PortWeb'


def token():
    p = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n', capture_output=True, text=True, cwd=ROOT)
    for line in p.stdout.splitlines():
        if line.startswith('password='):
            return line[9:]
    sys.exit('no hay credenciales de github.com en git')


def api(method, url, tok, data=None, raw=None, ctype='application/json'):
    body = raw if raw is not None else (json.dumps(data).encode() if data is not None else None)
    req = urllib.request.Request(url, data=body, method=method, headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json', 'User-Agent': 'ded-release', 'Content-Type': ctype, 'X-GitHub-Api-Version': '2022-11-28'})
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            return json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        sys.exit('GitHub %s %s -> %s %s' % (method, url.split('?')[0], e.code, e.read().decode()[:400]))


def notes_for(version, path):
    text = open(path, encoding='utf-8').read()
    m = re.search(r'^## +v?%s\b.*?$(.*?)(?=^## |\Z)' % re.escape(version), text, re.S | re.M)
    return (m.group(1) if m else text).strip()


def main():
    version = sys.argv[1].lstrip('v')
    notes = notes_for(version, os.path.join(ROOT, sys.argv[2] if len(sys.argv) > 2 else 'CHANGELOG.md'))
    exe = os.path.join(ROOT, 'desktop', 'release', 'DED-Instalador.exe')
    if not os.path.exists(exe):
        sys.exit('falta ' + exe)
    tok = token()
    tag = 'v' + version
    rel = api('POST', 'https://api.github.com/repos/%s/releases' % REPO, tok, {'tag_name': tag, 'target_commitish': 'main', 'name': 'División Especial de Detectives %s' % version, 'body': notes, 'draft': False, 'prerelease': False})
    print('release', rel['html_url'])
    name = 'DED-Instalador-%s.exe' % version
    url = rel['upload_url'].split('{')[0] + '?name=' + name
    asset = api('POST', url, tok, raw=open(exe, 'rb').read(), ctype='application/octet-stream')
    print('asset', asset['name'], asset['size'] // 1024, 'KB', asset['browser_download_url'])


if __name__ == '__main__':
    main()
