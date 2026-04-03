import { useState, useRef, useEffect } from 'react'

export function parseTags(str) {
  if (!str) return []
  // Split by '/' or ','
  return str.split(/[/,]/).map((t) => t.trim()).filter(Boolean)
}

export function displayTags(str, emptyLabel = '—', zoneClass = false) {
  const tags = parseTags(str)
  if (tags.length === 0) return <span className="empty-cell">{emptyLabel}</span>
  
  return (
    <>
      {tags.map((t, idx) => (
        <span key={idx} className={`tag ${zoneClass ? 'zone-tag' : ''}`}>
          {t}
        </span>
      ))}
    </>
  )
}

export default function NotionMultiSelect({ value, onChange, availableOptions = [], autoFocus }) {
  const [inputVal, setInputVal] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  const tags = parseTags(value)

  // focus on mount if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // close options on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowOptions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter((t) => t !== tagToRemove)
    onChange(newTags.join(' / '))
  }

  const addTag = (tagToAdd) => {
    const clean = tagToAdd.trim()
    if (!clean) return
    let newTags = [...tags]
    if (!newTags.includes(clean)) {
      newTags.push(clean)
    }
    onChange(newTags.join(' / '))
    setInputVal('')
    setShowOptions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputVal)
    } else if (e.key === 'Backspace' && inputVal === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  // Filter options: not already selected, matching input
  const filteredOptions = availableOptions.filter(
    (opt) => 
      !tags.includes(opt) && 
      opt.toLowerCase().includes(inputVal.toLowerCase())
  )

  return (
    <div 
      ref={wrapperRef}
      className="notion-multi-select"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="notion-multi-select-tags">
        {tags.map((t, idx) => (
          <span key={idx} className="notion-tag">
            {t}
            <button 
              type="button" 
              className="notion-tag-remove"
              onClick={(e) => { e.stopPropagation(); removeTag(t); }}
            >
              ✕
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => {
            setInputVal(e.target.value)
            setShowOptions(true)
          }}
          onFocus={() => setShowOptions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Ajouter..." : ""}
          className="notion-multi-select-input"
        />
      </div>

      {showOptions && filteredOptions.length > 0 && (
        <div className="notion-options-dropdown">
          {filteredOptions.slice(0, 10).map((opt, i) => (
            <div 
              key={i} 
              className="notion-option"
              onClick={(e) => {
                e.stopPropagation();
                addTag(opt);
              }}
            >
              {opt}
            </div>
          ))}
          {/* Option to create new if it doesn't match perfectly */}
          {inputVal.trim() && !filteredOptions.includes(inputVal.trim()) && (
            <div 
              className="notion-option create-new"
              onClick={(e) => {
                e.stopPropagation();
                addTag(inputVal);
              }}
            >
              Créer : "{inputVal}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}
