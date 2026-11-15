#!/usr/bin/env python3
"""Importa a grade completa de opções do opcoes.net.br para JSON normalizado (histórico por data).

Uso: python -I scripts/importar_grade.py PLANILHA.xlsx src/data/grades/<ativo>-<data>.json [ATIVO=BBAS3]

Só biblioteca padrão. A data da grade é a data de negócio mais recente da planilha.
Gregas e vol ficam na convenção do opcoes.net.br (vol em fração, theta por dia útil, vega por 1,0 de vol).
"""
import json, os, statistics, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fixture_grade import ler_linhas, data_excel  # noqa: E402


def f(x):
    return float(x) if x not in (None, '') else None


def main(entrada, saida, ativo='BBAS3'):
    linhas = ler_linhas(entrada)
    datas = [data_excel(r['Data/Hora']) for r in linhas if r['Data/Hora']]
    data = max(datas)
    spot = statistics.median(float(r['Strike']) / (1 + float(r['Dist. (%) do Strike']))
                             for r in linhas if r['Dist. (%) do Strike'])
    vencimentos, series = {}, []
    for r in linhas:
        venc = data_excel(r['Vencimento'])
        vencimentos[venc] = int(r['Dias úteis'])
        series.append({
            'ticker': r['Ticker'].strip(), 'tipo': r['Tipo'].lower(), 'strike': round(float(r['Strike']), 2),
            'venc': venc, 'du': int(r['Dias úteis']),
            'ultimo': f(r['Último']), 'data_ultimo': data_excel(r['Data/Hora']) if r['Data/Hora'] else None,
            'negocios': int(float(r['Núm. de Neg.'])) if r['Núm. de Neg.'] else None,
            'vol': f(r['Vol. Impl. (%)']), 'delta': f(r['Delta']), 'gama': f(r['Gamma']),
            'theta': f(r['Theta ($)']), 'vega': f(r['Vega']),
        })
    out = {'ativo': ativo, 'data': data, 'spot': round(spot, 4), 'fonte': 'opcoes.net.br',
           'vencimentos': dict(sorted(vencimentos.items())), 'series': series}
    os.makedirs(os.path.dirname(os.path.abspath(saida)), exist_ok=True)
    with open(saida, 'w', encoding='utf-8') as fp:
        json.dump(out, fp, ensure_ascii=False, separators=(',', ':'))
    print(f'{ativo} {data}: {len(series)} séries, {len(vencimentos)} vencimentos, spot {spot:.4f}')


if __name__ == '__main__':
    main(*sys.argv[1:4])
