# BlazeDemo Performance Tests

Projeto de testes de performance utilizando Apache JMeter.

## Objetivo

Validar o fluxo de compra de passagem aérea do BlazeDemo.

## Cenário

- Compra de passagem com sucesso

## Critérios de Aceitação

- 250 req/s
- P90 < 2 segundos

## Ferramentas

- Apache JMeter
- Java 17

## Estrutura

```text
jmeter/
reports/
results/
```

## Executar Teste de Carga

```powershell
.\jmeter.bat -n -t jmeter/carga_test.jmx -l results/carga.jtl
```

## Gerar Dashboard

```powershell
.\jmeter.bat -g results/carga.jtl -o reports/carga
```

## Resultado Esperado

- Throughput >= 250 req/s
- P90 < 2 segundos

## Evidências

Abrir:

```text
reports/carga/index.html
```

## Conclusão

O sistema apresentou estabilidade durante o teste de carga mantendo os critérios definidos.