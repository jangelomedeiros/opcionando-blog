#!/usr/bin/env python3
"""Extrai da planilha de opções do opcoes.net.br a amostra usada nos testes do motor.

Uso: python -I scripts/fixture_grade.py PLANILHA.xlsx SAIDA.json

Só biblioteca padrão (a planilha usa inline strings, sem sharedStrings.xml).
Filtro: negócio na data da grade, |strike/spot - 1| <= 10% e >= 8 dias úteis.
Valores de gregas ficam crus, na convenção do opcoes.net.br.
"""
import datetime, json, re, statistics, sys, zipfile
import xml.etree.ElementTree as ET

M = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
DATA = '2026-11-13'


def coluna(ref):
    n = 0
    for ch in re.match(r'[A-Z]+', ref).group():
        n = n * 26 + ord(ch) - 64
    return n - 1


def ler_linhas(caminho):
    z = zipfile.ZipFile(caminho)
    linhas = []
    for r in ET.fromstring(z.read('xl/worksheets/sheet1.xml')).iter(M + 'row'):
        d = {}
        for c in r.findall(M + 'c'):
            v = c.find(M + 'v')
            x = None if v is None else v.text
            if c.get('t') == 'inlineStr':
                x = ''.join(t.text or '' for t in c.iter(M + 't'))
            d[coluna(c.get('r'))] = x
        linhas.append(d)
    cab = [(linhas[1].get(i) or '').replace('\xa0', '').strip() for i in range(26)]
    return [{cab[i]: r.get(i) for i in range(26)} for r in linhas[2:] if r.get(0)]


def data_excel(s):
    return (datetime.date(1899, 12, 30) + datetime.timedelta(days=float(s))).isoformat()


def main(entrada, saida):
    linhas = ler_linhas(entrada)
    spot = statistics.median(float(r['Strike']) / (1 + float(r['Dist. (%) do Strike']))
                             for r in linhas if r['Dist. (%) do Strike'])
    vencimentos = {}
    for r in linhas:
        vencimentos[data_excel(r['Vencimento'])] = int(r['Dias úteis'])
    series = []
    for r in linhas:
        campos = ('Vol. Impl. (%)', 'Delta', 'Gamma', 'Vega', 'Theta ($)', 'Data/Hora', 'Último')
        if not all(r[c] for c in campos) or data_excel(r['Data/Hora']) != DATA:
            continue
        k, du = float(r['Strike']), int(r['Dias úteis'])
        if abs(k / spot - 1) > 0.10 or du < 8:
            continue
        series.append({
            'ticker': r['Ticker'].strip(), 'tipo': r['Tipo'].lower(), 'strike': k,
            'venc': data_excel(r['Vencimento']), 'du': du, 'ultimo': float(r['Último']),
            'vol': float(r['Vol. Impl. (%)']), 'delta': float(r['Delta']), 'gama': float(r['Gamma']),
            'theta': float(r['Theta ($)']), 'vega': float(r['Vega']),
        })
    out = {'fonte': 'opcoes.net.br', 'ativo': 'BBAS3', 'data': DATA, 'spot': round(spot, 4), 'r': 0.15,
           'vencimentos': dict(sorted(vencimentos.items())), 'series': series}
    with open(saida, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f'{len(series)} séries, {len(vencimentos)} vencimentos, spot {spot:.4f}')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
