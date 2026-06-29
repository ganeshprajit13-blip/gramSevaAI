'use client'

import { useState } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { EligibilityRule, EligibilityOperator, Profile } from '@/types'

interface RuleBuilderProps {
  initialRules?: EligibilityRule[]
  initialLogic?: 'AND' | 'OR'
  onChange: (rules: EligibilityRule[], logic: 'AND' | 'OR') => void
}

const OPERATORS: { value: EligibilityOperator; label: string }[] = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: '>', label: 'Greater Than' },
  { value: '>=', label: 'Greater Than or Equal' },
  { value: '<', label: 'Less Than' },
  { value: '<=', label: 'Less Than or Equal' },
  { value: 'in', label: 'One Of (comma separated)' },
  { value: 'not_in', label: 'Not One Of (comma separated)' },
]

const FIELDS: { value: keyof Profile | string; label: string; type: 'number' | 'text' | 'boolean' }[] = [
  { value: 'age', label: 'Age', type: 'number' },
  { value: 'gender', label: 'Gender', type: 'text' },
  { value: 'district', label: 'District', type: 'text' },
  { value: 'occupation', label: 'Occupation', type: 'text' },
  { value: 'annual_income', label: 'Annual Income', type: 'number' },
  { value: 'community', label: 'Community', type: 'text' },
  { value: 'disability', label: 'Disability (true/false)', type: 'boolean' },
  { value: 'farmer_status', label: 'Farmer Status (true/false)', type: 'boolean' },
  { value: 'land_ownership', label: 'Land Ownership (true/false)', type: 'boolean' },
  { value: 'education', label: 'Education Level', type: 'text' },
  { value: 'marital_status', label: 'Marital Status', type: 'text' },
]

export default function RuleBuilder({ initialRules = [], initialLogic = 'AND', onChange }: RuleBuilderProps) {
  const [rules, setRules] = useState<EligibilityRule[]>(initialRules)
  const [logic, setLogic] = useState<'AND' | 'OR'>(initialLogic)

  const handleAddRule = () => {
    const newRule: EligibilityRule = {
      field: 'age',
      operator: '>=',
      value: '',
      label: 'New Rule',
    }
    const updated = [...rules, newRule]
    setRules(updated)
    onChange(updated, logic)
  }

  const handleUpdateRule = (index: number, updates: Partial<EligibilityRule>) => {
    const updated = [...rules]
    updated[index] = { ...updated[index], ...updates }
    
    // Auto-generate label
    const fieldLabel = FIELDS.find((f) => f.value === updated[index].field)?.label || updated[index].field
    const opLabel = OPERATORS.find((o) => o.value === updated[index].operator)?.label || updated[index].operator
    updated[index].label = `${fieldLabel} ${opLabel} ${updated[index].value}`
    
    setRules(updated)
    onChange(updated, logic)
  }

  const handleRemoveRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index)
    setRules(updated)
    onChange(updated, logic)
  }

  const handleLogicChange = (newLogic: 'AND' | 'OR') => {
    setLogic(newLogic)
    onChange(rules, newLogic)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Eligibility Rules</label>
        <div className="flex items-center gap-2 text-sm bg-secondary p-1 rounded-lg">
          <button
            type="button"
            onClick={() => handleLogicChange('AND')}
            className={`px-3 py-1 rounded-md transition-colors ${logic === 'AND' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-secondary-foreground/10'}`}
          >
            Match ALL (AND)
          </button>
          <button
            type="button"
            onClick={() => handleLogicChange('OR')}
            className={`px-3 py-1 rounded-md transition-colors ${logic === 'OR' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-secondary-foreground/10'}`}
          >
            Match ANY (OR)
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-xl border-border bg-secondary/20">
            <p className="text-sm text-muted-foreground">No eligibility rules defined.</p>
            <p className="text-xs text-muted-foreground mt-1">This scheme will be open to everyone by default.</p>
          </div>
        ) : (
          rules.map((rule, index) => (
            <div key={index} className="flex flex-wrap md:flex-nowrap items-start md:items-center gap-3 p-4 bg-secondary/20 border border-border rounded-xl">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Field</label>
                  <select
                    value={rule.field as string}
                    onChange={(e) => handleUpdateRule(index, { field: e.target.value })}
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                  >
                    {FIELDS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Operator</label>
                  <select
                    value={rule.operator}
                    onChange={(e) => handleUpdateRule(index, { operator: e.target.value as EligibilityOperator })}
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                  >
                    {OPERATORS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Value</label>
                  <input
                    type="text"
                    value={Array.isArray(rule.value) ? rule.value.join(', ') : rule.value.toString()}
                    onChange={(e) => {
                      let val: string | string[] | boolean | number = e.target.value
                      if (rule.operator === 'in' || rule.operator === 'not_in') {
                        val = e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                      } else if (val === 'true') {
                        val = true
                      } else if (val === 'false') {
                        val = false
                      }
                      handleUpdateRule(index, { value: val })
                    }}
                    placeholder="Value..."
                    className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveRule(index)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-5 md:mt-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={handleAddRule}
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Rule
      </button>
    </div>
  )
}
