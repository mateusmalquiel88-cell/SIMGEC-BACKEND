# Documentação de Campos - Tabela Escolas

## Campos Administrativos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | ID único (PK) |
| codigo | TEXT | Código da escola (UNIQUE, obrigatório) |
| nome | TEXT | Nome/Designação da escola (obrigatório) |
| uor_codigo | TEXT | Código UOR |
| created_at | DATETIME | Data de criação |
| updated_at | DATETIME | Data última atualização |

## Localização Geográfica
| Campo | Tipo | Descrição | Filtro |
|-------|------|-----------|--------|
| provincia | TEXT | Província |  ✓ |
| municipio | TEXT | Município | ✓ |
| comuna | TEXT | Comuna | ✓ |
| zona_geografica | TEXT | Zona geográfica | ✓ |
| bairro | TEXT | Bairro/Quarteirão |  |
| endereco | TEXT | Endereço |  |

## Contacto
| Campo | Tipo | Descrição |
|-------|------|-----------|
| telefone | TEXT | Número de telefone |
| email | TEXT | Email da escola |

## Direção e Gestão
| Campo | Tipo | Descrição | Filtro |
|-------|------|-----------|--------|
| diretor | TEXT | Nome do Diretor | ✓ |
| subdiretor_pedagogico | TEXT | Subdiretor Pedagógico (SUBP) |  |
| subdiretor_administrativo | TEXT | Subdiretor Administrativo (SUBA) |  |
| total_subdirectores | INTEGER | Total de Subdirectores |  |
| chefe_secretaria | TEXT | Chefe de Secretaria | ✓ |

## Nível e Currículo
| Campo | Tipo | Descrição | Filtro |
|-------|------|-----------|--------|
| nivel_ensino | TEXT | Nível de Ensino | ✓ |
| classes_leccionadas | TEXT | Classes que leccionam |  |
| num_areas_saber | INTEGER | Nº de Áreas do Saber |  |
| areas_saber | TEXT | Áreas do Saber |  |
| curso_basico | TEXT | Curso Básico |  |
| cursos_ministrados | TEXT | Cursos Ministrados |  |

## Infraestrutura
| Campo | Tipo | Descrição | Filtro |
|-------|------|-----------|--------|
| num_salas | INTEGER | Nº de Salas | ✓ (range) |
| num_turmas | INTEGER | Nº de Turmas |  |
| num_turnos | INTEGER | Nº de Turnos |  |
| num_alunos_salas | INTEGER | Nº de Alunos/Salas |  |
| total_alunos | INTEGER | Total de Alunos | ✓ (range) |

## Pessoal e Recursos Humanos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| pessoal_docente | INTEGER | Pessoal Docente |
| pessoal_administrativo | INTEGER | Pessoal Administrativo |
| pessoal_auxiliar | INTEGER | Pessoal Auxiliar |
| total_trabalhadores | INTEGER | Total de Trabalhadores |
| coordenadores_classe_disciplina | INTEGER | Coordenadores de Classe/Disciplina |
| total_coordenadores | INTEGER | Total de Coordenadores |
| coordenador_turno | TEXT | Coordenador de Turno |
| coordenador_educacao_fisica | TEXT | Coordenador de Educação Física |
| coordenador_curso | TEXT | Coordenador de Curso |
| carreira_enfermagem | INTEGER | Carreira de Enfermagem |
| tecnico_terapeutico | INTEGER | Técnico Terapêutico |
| pessoal_tecnico | INTEGER | Pessoal Técnico |

## Documentação Oficial
| Campo | Tipo | Descrição |
|-------|------|-----------|
| num_decreto_executivo | TEXT | Nº de Decreto Executivo |
| estado | TEXT | Estado | ✓ |

---

# Exemplos de Filtro - Endpoint GET /escolas

## Busca Geral
```
GET /escolas?q=Escola Primária
```
Busca em: codigo, nome, municipio, comuna, provincia, uor_codigo

## Filtros Específicos
```
# Por Localização
GET /escolas?provincia=Luanda&municipio=Cazenga
GET /escolas?zona_geografica=Urbana

# Por Nível de Ensino
GET /escolas?nivel_ensino=Primário

# Por Gestão
GET /escolas?diretor=João Silva
GET /escolas?chefe_secretaria=Maria

# Por Estado
GET /escolas?estado=Ativo

# Por Infraestrutura (ranges)
GET /escolas?num_salas_min=5&num_salas_max=20
GET /escolas?total_alunos_min=100&total_alunos_max=500
```

## Combinações e Ordenação
```
# Múltiplos filtros
GET /escolas?provincia=Huíla&nivel_ensino=Secundário&estado=Ativo

# Com ordenação
GET /escolas?sortBy=nome&sortOrder=ASC
GET /escolas?sortBy=created_at&sortOrder=DESC

# Com paginação
GET /escolas?page=1&limit=50
GET /escolas?q=Escola&page=2&limit=25

# Completo
GET /escolas?provincia=Luanda&nivel_ensino=Primário&sortBy=nome&page=1&limit=50
```

## Resposta com Paginação
```json
{
  "data": [
    {
      "id": 1,
      "codigo": "ESC001",
      "nome": "Escola Primária Central",
      "provincia": "Luanda",
      "municipio": "Cazenga",
      "nivel_ensino": "Primário",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "totalPages": 3
  }
}
```

---

# Operações CRUD

## Criar Escola (POST /escolas)
```bash
curl -X POST http://localhost:3000/escolas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "ESC001",
    "nome": "Escola Primária Central",
    "provincia": "Luanda",
    "municipio": "Cazenga",
    "nivel_ensino": "Primário",
    "diretor": "João Silva",
    "num_salas": 10,
    "total_alunos": 500
  }'
```

## Atualizar Escola (PUT /escolas/:id)
```bash
curl -X PUT http://localhost:3000/escolas/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "ESC001",
    "nome": "Escola Primária Central Renovada",
    "diretor": "Maria Santos",
    "total_alunos": 520
  }'
```

## Obter Escola (GET /escolas/:id)
```bash
curl -X GET http://localhost:3000/escolas/1 \
  -H "Authorization: Bearer <token>"
```

## Eliminar Escola (DELETE /escolas/:id)
```bash
curl -X DELETE http://localhost:3000/escolas/1 \
  -H "Authorization: Bearer <token>"
```

---

# Notas Importantes

1. **Atualizações Automáticas**: O campo `updated_at` é atualizado automaticamente em cada PUT.
2. **Campos Obrigatórios**: Apenas `codigo` e `nome` são obrigatórios.
3. **Campos de Texto**: Campos como `diretor`, `chefe_secretaria` são buscados com LIKE (parcial).
4. **Campos Numéricos**: Podem ser nulos (NULL) ou inteiros ≥ 0.
5. **Paginação**: Padrão é 50 registros por página, máximo 100.
6. **Busca por Decreto**: O campo `num_decreto_executivo` pode ser usado para rastrear alterações legais.
7. **Filtros Composto**: Todos os filtros podem ser combinados para buscas complexas.
