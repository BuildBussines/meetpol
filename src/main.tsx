import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './lib/auth'
import './styles.css'

// Google Translate rewrites text nodes, which can make React throw on removeChild/insertBefore. Make them tolerant.
const rc = Node.prototype.removeChild as any, ib = Node.prototype.insertBefore as any
;(Node.prototype as any).removeChild = function (c: Node) { return c.parentNode !== this ? c : rc.call(this, c) }
;(Node.prototype as any).insertBefore = function (n: Node, r: Node | null) { return r && r.parentNode !== this ? n : ib.call(this, n, r) }

createRoot(document.getElementById('root')!).render(<BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>)
