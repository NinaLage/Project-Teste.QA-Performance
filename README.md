# Projeto de Testes QA Performance

# Objetivo

Esse projeto tem como objetivo realizar um teste de carga e um teste de pico para validar a performance do site.

# Automação:

Foram Criados Cenários de testes, onde foram validados:

. Compra de passagem com sucesso
. Considerando: 250 req/s ; P90 < 2 segundos

# Tecnologias utilizadas

- Apache JMeter
- Java 17

# Estrutura do Script

```text
jmeter/
reports/
results/
```

# Executar Teste de Carga

```powershell
.\jmeter.bat -n -t jmeter/carga_test.jmx -l results/carga.jtl
```

# Gerar Dashboard

```powershell
.\jmeter.bat -g results/carga.jtl -o reports/carga
```

# Resultado Esperado

- Throughput >= 250 req/s
- P90 < 2 segundos

# Evidências

Abrir:

```text
reports/carga/index.html
```

# Conclusão

O sistema apresentou estabilidade durante o teste de carga mantendo os critérios definidos.
